package com.iteratec.springbootservice.controller;

import com.iteratec.springbootservice.config.MicrozooConfigProperties;
import com.iteratec.springbootservice.dto.BaseDto;
import com.iteratec.springbootservice.service.BaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("api/base")
@RequiredArgsConstructor
@Slf4j
public class BaseController {
    private final BaseService baseService;
    private final MicrozooConfigProperties configProperties;

    private static class Delay {
        private TimeUnit unit;
        private long value;

        Delay(String time) {
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
                    case "s": unit = TimeUnit.SECONDS;
                        break;
                    case "ms": unit = TimeUnit.MILLISECONDS;
                        break;
                    default:
                        // Should never happen. unit stays null
                }
            }
        }

        void go() {
            if (unit != null && value != 0) {
                try {
                    unit.sleep(value);
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    @GetMapping
    public Iterable<BaseDto> getAll() {
        log.info("Entered GET api/base");
        new Delay(configProperties.getRequestDelay()).go();
        log.info("Initiating upstream request");
        Iterable<BaseDto> result = baseService.getAll();
        log.info("Received upstream request results");
        new Delay(configProperties.getResponseDelay()).go();
        log.info("Exiting GET api/base");
        return result;
    }
}
