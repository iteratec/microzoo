package com.iteratec.springbootservice.controller;

import com.iteratec.springbootservice.dto.BaseDto;
import com.iteratec.springbootservice.service.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/base")
@RequiredArgsConstructor
public class BaseController {
    @Autowired
    private BaseService baseService;

    @GetMapping
    public Iterable<BaseDto> getAll() {
        return baseService.getAll();
    }
}
