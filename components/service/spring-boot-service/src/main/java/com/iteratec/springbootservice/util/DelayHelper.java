package com.iteratec.springbootservice.util;

import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DelayHelper {
    private TimeUnit unit;
    private long value;

    public DelayHelper(String time) {
        if (time != null) {
            parseTime(time);
        }
    }

    private void parseTime(String time) {
        final Pattern pattern = Pattern.compile("(\\d+)\\s*(s|ms)");
        final Matcher matcher = pattern.matcher(time);

        if (matcher.find()) {
            value = Long.parseLong(matcher.group(1));

            switch (matcher.group(2)) {
                case "s":
                    unit = TimeUnit.SECONDS;
                    break;
                case "ms":
                    unit = TimeUnit.MILLISECONDS;
                    break;
                default:
                    // Should never happen. unit stays null
            }
        }
    }

    public void go() {
        if (unit != null && value != 0) {
            try {
                unit.sleep(value);
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
