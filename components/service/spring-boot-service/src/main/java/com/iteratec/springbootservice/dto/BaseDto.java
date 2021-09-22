package com.iteratec.springbootservice.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.Tolerate;

@Data
@Builder
public class BaseDto {
    private Long id;
    private String payload;

    @Tolerate
    public BaseDto() {
        // Empty
    }
}
