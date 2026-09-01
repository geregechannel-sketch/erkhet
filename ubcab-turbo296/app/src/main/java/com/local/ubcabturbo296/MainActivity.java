package com.local.ubcabturbo296;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ScrollView scroll = new ScrollView(this);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        int p = (int) (20 * getResources().getDisplayMetrics().density);
        root.setPadding(p, p, p, p);
        scroll.addView(root, new ScrollView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView title = new TextView(this);
        title.setText("UBCab Turbo v0.29.6 TEST");
        title.setTextSize(26);
        title.setTextColor(Color.BLACK);
        root.addView(title);

        TextView info = new TextView(this);
        info.setText("UBCab 4.3.84 дээрх бодит UI tree-д тохируулсан тест build.\n\n" +
                "20:00-аас хойш: маргаашийг нэг удаа сонгоно → semantic Refresh 500 мс cadence → 20/45/80 мс acceptance probe.\n\n" +
                "Refresh дээр coordinate tap ашиглахгүй. UBCab-ийн clickable Button / refresh icon node дээр ACTION_CLICK ашиглана.\n\n" +
                "ТЕСТЛЭХДЭЭ хуучин UBCab helper болон Tino Accessibility-г OFF байлга.");
        info.setTextSize(17);
        info.setTextColor(Color.DKGRAY);
        info.setPadding(0, p / 2, 0, p);
        root.addView(info);

        Button a11y = new Button(this);
        a11y.setText("ACCESSIBILITY НЭЭХ");
        a11y.setOnClickListener(v -> startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)));
        root.addView(a11y);

        Button details = new Button(this);
        details.setText("APP INFO / BATTERY");
        details.setOnClickListener(v -> startActivity(new Intent(
                Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.parse("package:" + getPackageName()))));
        root.addView(details);

        Button ubcab = new Button(this);
        ubcab.setText("UBCAB DRIVER НЭЭХ");
        ubcab.setOnClickListener(v -> {
            Intent launch = getPackageManager().getLaunchIntentForPackage("mn.ubcab.driver");
            if (launch != null) startActivity(launch);
        });
        root.addView(ubcab);

        setContentView(scroll);
    }
}
