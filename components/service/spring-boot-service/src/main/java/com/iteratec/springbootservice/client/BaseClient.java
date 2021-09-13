package com.iteratec.springbootservice.client;

import com.iteratec.springbootservice.dto.BaseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.net.URI;

@FeignClient(name = "base", url = "http://localhost")
public interface BaseClient {
    @GetMapping(value = "base")
    Iterable<BaseDto> getAll(URI baseUrl);
}
