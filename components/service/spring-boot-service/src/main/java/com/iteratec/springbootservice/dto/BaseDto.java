package de.elementec.springbootservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(setterPrefix = "with")
public class BaseDto {
    Long id;
    String payload;
}
