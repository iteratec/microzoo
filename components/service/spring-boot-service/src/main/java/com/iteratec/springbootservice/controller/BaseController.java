package com.iteratec.springbootservice.controller;

import com.iteratec.springbootservice.dto.BaseDto;
import com.iteratec.springbootservice.service.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("api/base")
@RequiredArgsConstructor
public class BaseController {
    @Autowired
    private BaseService baseService;

    @GetMapping
    public Iterable<BaseDto> getAll() {
        try {
            TimeUnit.MILLISECONDS.sleep(5);
        }
        catch(InterruptedException exception) {
            Thread.currentThread().interrupt();
        }

        Iterable<BaseDto> result = baseService.getAll();

        try {
            TimeUnit.MILLISECONDS.sleep(10);
        }
        catch(InterruptedException exception) {
            Thread.currentThread().interrupt();
        }

        return result;
    }
}
