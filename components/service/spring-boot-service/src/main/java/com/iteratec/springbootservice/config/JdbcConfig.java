package com.iteratec.springbootservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Profile("jdbc")
@Configuration
@EnableJpaRepositories(basePackages= {"com.iteratec.springbootservice.repository.jdbc"})
public class JdbcConfig {
}
