package com.local.ubcabturbo296;

import android.accessibilityservice.AccessibilityService;
import android.graphics.Rect;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * UBCab 4.3.84 / build 708 live-tree based TURBO test service.
 *
 * IMPORTANT:
 * - No private API, token, server call or GPS eligibility bypass.
 * - No coordinate tap / dispatchGesture.
 * - Refresh is ACTION_CLICK on the real clickable Accessibility node.
 * - The service does not auto-click Start trip / End trip / Cancel.
 */
public class TurboAccessibilityService extends AccessibilityService {
    private static final String TAG = "UBCabTurbo296";
    private static final String UBCAB = "mn.ubcab.driver";
    private static final long REFRESH_CADENCE_MS = 500L;
    private static final long[] PROBE_DELAYS_MS = {20L, 45L, 80L};
    private static final long ACTION_DEBOUNCE_MS = 100L;
    private static final long ACCEPT_FLOW_TIMEOUT_MS = 8_000L;
    private static final int MIN_LEAD_MINUTES_EXCLUSIVE = 150;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean inspecting = false;
    private boolean tomorrowArmed = false;
    private long tomorrowArmedAt = 0L;
    private long refreshNotBefore = 0L;
    private long lastRefreshAt = 0L;
    private long lastBookingListSeenAt = 0L;
    private long lastActionAt = 0L;
    private boolean acceptanceFlow = false;
    private boolean pendingEligible = false;
    private long acceptanceStartedAt = 0L;
    private int probeGeneration = 0;
    private final Set<Integer> blockedCards = new HashSet<>();

    private final Runnable loop = new Runnable() {
        @Override public void run() {
            safeInspect("heartbeat");
            handler.postDelayed(this, 120L);
        }
    };

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        tomorrowArmed = false;
        acceptanceFlow = false;
        pendingEligible = false;
        Log.d(TAG, "SERVICE_CONNECTED v0.29.6 refresh=500ms probes=20/45/80 semantic-only");
        handler.removeCallbacks(loop);
        handler.post(loop);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        CharSequence pkg = event.getPackageName();
        if (pkg == null || !UBCAB.contentEquals(pkg)) return;
        safeInspect("event:" + event.getEventType());
        armProbes();
    }

    @Override public void onInterrupt() { }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(loop);
        probeGeneration++;
        super.onDestroy();
    }

    private void safeInspect(String origin) {
        if (inspecting) return;
        inspecting = true;
        try {
            inspect(origin);
        } catch (Throwable t) {
            Log.e(TAG, "INSPECT_ERROR " + t.getClass().getSimpleName() + ":" + t.getMessage(), t);
        } finally {
            inspecting = false;
        }
    }

    private void inspect(String origin) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || root.getPackageName() == null || !UBCAB.contentEquals(root.getPackageName())) return;

        String joined = normalize(collectText(root));
        long now = SystemClock.elapsedRealtime();

        if (isManualTripScreen(joined)) {
            Log.d(TAG, "MANUAL_TRIP_GUARD origin=" + origin);
            return;
        }

        if (!acceptanceFlow && isOrdinaryIncomingOffer(joined)) {
            Log.d(TAG, "ORDINARY_PRIORITY origin=" + origin);
            return;
        }

        if (acceptanceFlow) {
            if (isSuccessProof(joined)) {
                Log.d(TAG, "ACCEPT_SUCCESS_PROOF");
                resetAcceptance();
                playSuccessTone();
                return;
            }
            if (now - acceptanceStartedAt > ACCEPT_FLOW_TIMEOUT_MS) {
                Log.w(TAG, "ACCEPT_TIMEOUT");
                resetAcceptance();
                return;
            }
            processAcceptance(root, joined, now, origin);
            return;
        }

        if (!isBookingList(joined)) {
            if (now - lastBookingListSeenAt > 1_500L) tomorrowArmed = false;
            return;
        }
        lastBookingListSeenAt = now;

        // This test build only changes the after-20:00 path proven by the live Tab audit.
        int hour = LocalTime.now().getHour();
        if (hour < 20) {
            tomorrowArmed = false;
            return;
        }

        if (!tomorrowArmed) {
            AccessibilityNodeInfo tomorrow = findTomorrowDateNode(root);
            if (tomorrow != null && clickNode(tomorrow)) {
                tomorrowArmed = true;
                tomorrowArmedAt = now;
                refreshNotBefore = now + 220L;
                Log.d(TAG, "TOMORROW_ARMED semantic_date_click");
                armProbes();
            }
            return;
        }

        int count = parseOrderCount(joined);
        if (count > 0) {
            AccessibilityNodeInfo card = findBestOrderCard(root);
            if (card != null) {
                String cardText = normalize(collectText(card));
                int sig = cardText.hashCode();
                if (blockedCards.contains(sig)) return;
                if (isXlVan(cardText)) {
                    blockedCards.add(sig);
                    Log.d(TAG, "MULTI_ORDER_SKIP_XL sig=" + sig);
                    return;
                }
                SafetyDecision safety = evaluateSafety(cardText);
                if (safety == SafetyDecision.BLOCK) {
                    blockedCards.add(sig);
                    Log.d(TAG, "PENALTY_SAFETY_BLOCK_LIST sig=" + sig);
                    return;
                }
                if (clickNode(card)) {
                    acceptanceFlow = true;
                    pendingEligible = safety == SafetyDecision.ALLOW;
                    acceptanceStartedAt = now;
                    lastActionAt = now;
                    probeGeneration++;
                    Log.d(TAG, "CARD_CLICK_FAST safety=" + safety + " sig=" + sig);
                    armProbes();
                }
            }
            return;
        }

        if (now < refreshNotBefore) return;
        if (now - lastRefreshAt < REFRESH_CADENCE_MS) return;

        AccessibilityNodeInfo refresh = findRefreshNode(root);
        if (refresh != null && clickNode(refresh)) {
            lastRefreshAt = now;
            Log.d(TAG, "REFRESH_CLICK_SENT semantic=true cadence=500");
            armProbes();
        } else {
            Log.w(TAG, "REFRESH_NODE_NOT_FOUND no_coordinate_fallback");
        }
    }

    private void processAcceptance(AccessibilityNodeInfo root, String joined, long now, String origin) {
        if (!pendingEligible) {
            SafetyDecision decision = evaluateSafety(joined);
            if (decision == SafetyDecision.BLOCK) {
                Log.d(TAG, "PENALTY_SAFETY_BLOCK_DETAILS");
                resetAcceptance();
                return;
            }
            if (decision == SafetyDecision.UNKNOWN) {
                // Do not submit a scheduled order when start time cannot be verified.
                Log.d(TAG, "SAFETY_WAIT_DETAILS_TIME");
                return;
            }
            pendingEligible = true;
            Log.d(TAG, "PENALTY_SAFETY_ALLOW_DETAILS");
        }

        if (now - lastActionAt < ACTION_DEBOUNCE_MS) return;
        AccessibilityNodeInfo action = findAcceptanceAction(root);
        if (action != null && clickNode(action)) {
            String label = normalize(nodeLabel(action));
            lastActionAt = now;
            Log.d(TAG, "ACCEPT_ACTION origin=" + origin + " label=" + label);
            armProbes();
        }
    }

    private void armProbes() {
        final int generation = ++probeGeneration;
        for (long delay : PROBE_DELAYS_MS) {
            handler.postDelayed(() -> {
                if (generation != probeGeneration) return;
                safeInspect("probe:" + delay);
            }, delay);
        }
    }

    private AccessibilityNodeInfo findRefreshNode(AccessibilityNodeInfo root) {
        List<AccessibilityNodeInfo> nodes = allNodes(root);
        for (AccessibilityNodeInfo n : nodes) {
            if (!isClickableEnabled(n)) continue;
            String desc = n.getContentDescription() == null ? "" : n.getContentDescription().toString().trim();
            if ("".equals(desc)) {
                Log.d(TAG, "REFRESH_NODE exact_icon");
                return n;
            }
        }

        Rect win = bounds(root);
        List<AccessibilityNodeInfo> structural = new ArrayList<>();
        for (AccessibilityNodeInfo n : nodes) {
            if (!isClickableEnabled(n)) continue;
            CharSequence cls = n.getClassName();
            if (cls == null || !cls.toString().endsWith("Button")) continue;
            Rect r = bounds(n);
            if (r.isEmpty()) continue;
            float xr = (r.centerX() - win.left) / (float) Math.max(1, win.width());
            float yr = (r.centerY() - win.top) / (float) Math.max(1, win.height());
            if (xr > 0.82f && yr > 0.30f && yr < 0.45f && r.width() < 180 && r.height() < 180) {
                structural.add(n);
            }
        }
        if (structural.size() == 1) {
            Log.d(TAG, "REFRESH_NODE unique_structural_button");
            return structural.get(0);
        }
        return null;
    }

    private AccessibilityNodeInfo findTomorrowDateNode(AccessibilityNodeInfo root) {
        int day = LocalDate.now().plusDays(1).getDayOfMonth();
        Rect win = bounds(root);
        for (AccessibilityNodeInfo n : allNodes(root)) {
            if (!isClickableEnabled(n)) continue;
            String d = n.getContentDescription() == null ? "" : n.getContentDescription().toString().trim();
            if (d.isEmpty()) continue;
            String first = d.split("\\s+")[0];
            if (!String.valueOf(day).equals(first)) continue;
            Rect r = bounds(n);
            float yr = (r.centerY() - win.top) / (float) Math.max(1, win.height());
            if (yr > 0.12f && yr < 0.36f && r.height() < 260) return n;
        }
        return null;
    }

    private AccessibilityNodeInfo findBestOrderCard(AccessibilityNodeInfo root) {
        Rect win = bounds(root);
        AccessibilityNodeInfo best = null;
        int bestScore = -1;
        for (AccessibilityNodeInfo n : allNodes(root)) {
            if (!isClickableEnabled(n)) continue;
            Rect r = bounds(n);
            if (r.isEmpty()) continue;
            if (r.height() > win.height() * 0.65f) continue;
            String t = normalize(collectText(n));
            if (t.isEmpty()) continue;
            if (t.contains("цаг/үнэ") || t.contains("миний авсан") || t.contains("жагсаалт")) continue;
            if (t.matches(".*(^|\\s)\\d{1,2}\\s+(да|мя|лх|пү|ба|бя|ня)(\\s|$).*")) continue;
            int score = 0;
            if (TIME_PATTERN.matcher(t).find()) score += 3;
            if (t.contains("₮") || t.contains("төг")) score += 3;
            if (t.contains("хаяг") || t.contains("авах") || t.contains("буулгах") || t.contains("→")) score += 2;
            if (t.contains("км")) score += 1;
            if (score > bestScore && score >= 4) {
                bestScore = score;
                best = n;
            }
        }
        return best;
    }

    private AccessibilityNodeInfo findAcceptanceAction(AccessibilityNodeInfo root) {
        String[] labels = {
                "баталгаажуулах",
                "тийм, баталгаажуулах",
                "захиалгыг баталгаажуулах",
                "захиалгыг авах",
                "захиалга авах",
                "тийм, захиалгыг авах",
                "тийм, авах",
                "тийм",
                "үргэлжлүүлэх"
        };
        for (String wanted : labels) {
            for (AccessibilityNodeInfo n : allNodes(root)) {
                if (!isClickableEnabled(n)) continue;
                String label = normalize(nodeLabel(n));
                if (!wanted.equals(label)) continue;
                if (label.contains("ажил эхлүүлэх") || label.contains("аялал")) continue;
                return n;
            }
        }
        return null;
    }

    private SafetyDecision evaluateSafety(String text) {
        String t = normalize(text);
        if (isXlVan(t)) return SafetyDecision.BLOCK;
        Matcher m = TIME_PATTERN.matcher(t);
        if (!m.find()) return SafetyDecision.UNKNOWN;
        int h;
        int min;
        try {
            h = Integer.parseInt(m.group(1));
            min = Integer.parseInt(m.group(2));
        } catch (Exception e) {
            return SafetyDecision.UNKNOWN;
        }
        if (h > 23 || min > 59) return SafetyDecision.UNKNOWN;

        LocalDate targetDate = LocalDate.now().plusDays(1);
        LocalDateTime scheduled = LocalDateTime.of(targetDate, LocalTime.of(h, min));
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        long lead = Duration.between(now, scheduled).toMinutes();
        Log.d(TAG, "SAFETY_LEAD_MINUTES=" + lead + " time=" + h + ":" + min);
        return lead > MIN_LEAD_MINUTES_EXCLUSIVE ? SafetyDecision.ALLOW : SafetyDecision.BLOCK;
    }

    private boolean isBookingList(String t) {
        return t.contains("захиалгат дуудлага") && t.contains("жагсаалт") && t.contains("миний авсан");
    }

    private boolean isOrdinaryIncomingOffer(String t) {
        boolean actions = t.contains("цуцлах") && (t.contains("зөвшөөрөх") || t.contains("авах"));
        return actions && !t.contains("захиалгат дуудлага");
    }

    private boolean isManualTripScreen(String t) {
        return t.contains("ажил эхлүүлэх үү") || t.contains("аялал эхлүүлэх") ||
                t.contains("аялал дуусгах") || t.contains("ажил дуусгах");
    }

    private boolean isSuccessProof(String t) {
        return t.contains("амжилттай") || t.contains("захиалга авлаа") ||
                (t.contains("баталгаажсан") && t.contains("захиалга"));
    }

    private boolean isXlVan(String t) {
        String n = normalize(t).replace("-", " ");
        return n.contains("xl van") || n.contains("xlvan") || (n.contains("xl") && n.contains("van"));
    }

    private int parseOrderCount(String t) {
        Matcher m = ORDER_COUNT_PATTERN.matcher(t);
        if (!m.find()) return 0;
        try { return Integer.parseInt(m.group(1)); }
        catch (Exception e) { return 0; }
    }

    private boolean clickNode(AccessibilityNodeInfo node) {
        if (!isClickableEnabled(node)) return false;
        try {
            boolean ok = node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            Log.d(TAG, "ACTION_CLICK ok=" + ok + " label=" + normalize(nodeLabel(node)) + " bounds=" + bounds(node));
            return ok;
        } catch (Throwable t) {
            Log.w(TAG, "ACTION_CLICK_ERROR " + t.getClass().getSimpleName());
            return false;
        }
    }

    private boolean isClickableEnabled(AccessibilityNodeInfo n) {
        return n != null && n.isEnabled() && n.isClickable() && n.isVisibleToUser();
    }

    private List<AccessibilityNodeInfo> allNodes(AccessibilityNodeInfo root) {
        List<AccessibilityNodeInfo> out = new ArrayList<>();
        collectNodes(root, out, 0);
        return out;
    }

    private void collectNodes(AccessibilityNodeInfo n, List<AccessibilityNodeInfo> out, int depth) {
        if (n == null || depth > 35) return;
        out.add(n);
        int count = n.getChildCount();
        for (int i = 0; i < count; i++) {
            AccessibilityNodeInfo c = n.getChild(i);
            if (c != null) collectNodes(c, out, depth + 1);
        }
    }

    private String collectText(AccessibilityNodeInfo root) {
        StringBuilder sb = new StringBuilder();
        appendText(root, sb, 0);
        return sb.toString();
    }

    private void appendText(AccessibilityNodeInfo n, StringBuilder sb, int depth) {
        if (n == null || depth > 35 || sb.length() > 20_000) return;
        if (n.getText() != null && n.getText().length() > 0) sb.append(' ').append(n.getText());
        if (n.getContentDescription() != null && n.getContentDescription().length() > 0) sb.append(' ').append(n.getContentDescription());
        for (int i = 0; i < n.getChildCount(); i++) {
            AccessibilityNodeInfo c = n.getChild(i);
            if (c != null) appendText(c, sb, depth + 1);
        }
    }

    private String nodeLabel(AccessibilityNodeInfo n) {
        if (n == null) return "";
        if (n.getText() != null && n.getText().length() > 0) return n.getText().toString();
        if (n.getContentDescription() != null) return n.getContentDescription().toString();
        return "";
    }

    private Rect bounds(AccessibilityNodeInfo n) {
        Rect r = new Rect();
        if (n != null) n.getBoundsInScreen(r);
        return r;
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.toLowerCase(Locale.getDefault()).replaceAll("\\s+", " ").trim();
    }

    private void resetAcceptance() {
        acceptanceFlow = false;
        pendingEligible = false;
        acceptanceStartedAt = 0L;
        lastActionAt = 0L;
        probeGeneration++;
    }

    private void playSuccessTone() {
        try {
            ToneGenerator tg = new ToneGenerator(AudioManager.STREAM_NOTIFICATION, 90);
            tg.startTone(ToneGenerator.TONE_PROP_ACK, 180);
            handler.postDelayed(() -> {
                try { tg.release(); } catch (Throwable ignored) { }
            }, 260L);
        } catch (Throwable ignored) { }
    }

    private enum SafetyDecision { ALLOW, BLOCK, UNKNOWN }

    private static final Pattern TIME_PATTERN = Pattern.compile("(?:^|\\D)([01]?\\d|2[0-3]):([0-5]\\d)(?:\\D|$)");
    private static final Pattern ORDER_COUNT_PATTERN = Pattern.compile("(?:^|\\s)(\\d+)\\s*захиалга(?:\\s|$)");
}
