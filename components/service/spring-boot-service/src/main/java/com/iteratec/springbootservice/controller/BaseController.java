package com.iteratec.springbootservice.controller;

import com.iteratec.springbootservice.config.MicrozooConfigProperties;
import com.iteratec.springbootservice.dto.BaseDto;
import com.iteratec.springbootservice.service.BaseService;
import com.iteratec.springbootservice.util.DelayHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/base")
@RequiredArgsConstructor
@Slf4j
public class BaseController {
    private final BaseService baseService;
    private final MicrozooConfigProperties configProperties;

    @GetMapping
    public Iterable<BaseDto> getAll() {
        log.info("Entered GET api/base");
        new DelayHelper(configProperties.getRequestDelay()).go();
        log.info("Initiating upstream request");
        Iterable<BaseDto> result = baseService.getAll();
        log.info("Received upstream request results");
        new DelayHelper(configProperties.getResponseDelay()).go();
        log.info("Exiting GET api/base");
        return result;
    }

    @PostMapping
    public BaseDto create(@RequestBody BaseDto baseDto) {
        log.info("Entered POST api/base");
        new DelayHelper(configProperties.getRequestDelay()).go();
        BaseDto result = baseService.create(baseDto);
        new DelayHelper(configProperties.getResponseDelay()).go();
        log.info("Exiting POST api/base");
        return result;
    }
}
