UBCab Order Helper v0.29.8 RACE — Windows Build Installer
=========================================================

THIS IS THE FULL v0.29.x HELPER LINEAGE, NOT THE SMALL v0.29.6 TURBO TEST APP.

What changes in v0.29.8 RACE
----------------------------
1. Removes the automatic 20:00 date switch.
2. Keeps manual date choice:
   - FIRST DAY
   - NEXT DAY
3. Keeps the chosen day until the user changes it.
4. Faster selected-day Refresh target:
   - Galaxy S25: 300 ms
   - Galaxy Tab A11: 420 ms
   - Generic fast: 350 ms
   - Fallback: 500 ms
5. Acceptance probes after Refresh/events: 10 / 25 / 45 ms.
6. Confirmation retries: 0 / 15 / 30 / 55 / 90 ms.
7. Take/second-confirm retry starts at 15 ms.
8. Acceptance action debounce: 60 ms.
9. Semantic-only Refresh strategy is preserved. No blind coordinate Refresh fallback.
10. Full features remain: reminders, history/statistics DB, multi-order, XL-Van exclusion,
    ordinary-call priority, <=150 minute penalty guard, final manual trip-start protection,
    diagnostics/recovery and S25/Tab device profiles.

Files you need
--------------
- UBCabOrderHelper-v0.29.8-RACE-Build-Installer.zip (this package)
- UBCabOrderHelper-source-v0.29.7-FULL.zip (full source archive supplied in the chat)

How to install
--------------
1. Extract this installer ZIP completely.
2. Put UBCabOrderHelper-source-v0.29.7-FULL.zip beside START_HERE_v0.29.8_RACE.bat.
   If it is elsewhere, the installer opens a file picker.
3. Connect exactly ONE Android device by USB and enable USB debugging.
4. Run START_HERE_v0.29.8_RACE.bat.
5. The script patches the FULL source to v0.29.8 RACE, audits it, downloads Java/Android build
   tools if needed, builds the APK, verifies package/version/signature/zipalign, and installs it.
6. If the old helper has a different signing certificate, the script asks before clean-reinstalling
   ONLY com.local.ubcabassistant. It does not uninstall UBCab Driver.
7. Enable helper Accessibility and Notification access; set helper/UBCab battery to Unrestricted.

Important
---------
The program can reduce local UI reaction delay but cannot guarantee winning a server-side race.
UBCab server eligibility, network delay and another driver's earlier acceptance remain outside the
helper's control.

For best UBCab-only race testing on Tab A11, temporarily disable Tino helper Accessibility and
Link to Windows Accessibility so they do not add event/memory load.
