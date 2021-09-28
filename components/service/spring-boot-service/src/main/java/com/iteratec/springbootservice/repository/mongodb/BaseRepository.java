package com.iteratec.springbootservice.repository.mongodb;

import com.iteratec.springbootservice.entity.Base;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BaseRepository extends MongoRepository<Base, Long> {
}
