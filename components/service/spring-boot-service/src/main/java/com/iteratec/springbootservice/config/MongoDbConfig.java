package com.iteratec.springbootservice.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Profile("mongodb")
@Configuration
@EnableMongoRepositories(basePackages= {"com.iteratec.springbootservice.repository.mongodb"})
public class MongoDbConfig {

    @Autowired
    private MicrozooConfigProperties configProperties;

    @Bean
    public MongoClient mongo() {
        var mongoProperties = configProperties.getMongodb();
        var url = String.format("mongodb://%s:%s/%s", mongoProperties.getHost(), mongoProperties.getPort(), mongoProperties.getDbname());
        var connectionString = new ConnectionString(url);
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();

        return MongoClients.create(mongoClientSettings);
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        var mongoProperties = configProperties.getMongodb();
        return new MongoTemplate(mongo(), mongoProperties.getDbname());
    }
}
