package de.elementec.springbootservice.controller;

import de.elementec.springbootservice.dto.BaseDto;
import de.elementec.springbootservice.dto.BaseDtoFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/base")
public class BaseController {
    @GetMapping
    List<BaseDto> getAll() {
        return BaseDtoFactory.createArray(10,10);
    }
}
