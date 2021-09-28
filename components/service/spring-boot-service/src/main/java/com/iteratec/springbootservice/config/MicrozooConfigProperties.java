package com.iteratec.springbootservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "microzoo")
@Data
public class MicrozooConfigProperties {
    @Data
    static class MongoDbConfigProperties {
        private String host;
        private String port;
        private String dbname;
    }


    // Time to delay a request to an upstream service
    private String requestDelay;

    // Time to delay a response from an upstream service
    private String responseDelay;

    // URLs of upstream services
    private String upstreamServices;

    private Integer entityCount;

    private Integer payloadSize;

    private MongoDbConfigProperties mongodb;

    public String[] getUpstreamServicesAsArray() {
        return upstreamServices.split(",");
    }

    public boolean isValid(String configValue) {
        return configValue != null && !configValue.isEmpty();
    }
}
