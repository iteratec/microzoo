package com.iteratec.springbootservice;

import com.iteratec.springbootservice.config.MicrozooConfigProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(MicrozooConfigProperties.class)
public class SpringBootServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootServiceApplication.class, args);
    }

}
