package com.iteratec.springbootservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "microzoo")
@Data
public class MicrozooConfigProperties {
    // Time to delay a request to an upstream service
    private String requestDelay;

    // Time to delay a resonse from an upstream service
    private String responseDelay;
}
