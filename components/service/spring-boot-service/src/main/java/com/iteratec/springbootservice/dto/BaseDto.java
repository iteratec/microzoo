package com.iteratec.springbootservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BaseDto {
    private Long id;
    private String payload;
}
