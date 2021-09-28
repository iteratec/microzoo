package com.iteratec.springbootservice.repository;

import com.iteratec.springbootservice.entity.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Service;

@Service
public class BaseRepositoryProxy {
    @Autowired(required = false)
    private com.iteratec.springbootservice.repository.jdbc.BaseRepository baseRepositoryJdbc;

    @Autowired(required = false)
    private com.iteratec.springbootservice.repository.mongodb.BaseRepository baseRepositoryMongo;

    public CrudRepository<Base, Long> getRepository() {
        if (baseRepositoryJdbc != null) {
            return baseRepositoryJdbc;
        }
        else if (baseRepositoryMongo != null) {
            return baseRepositoryMongo;
        }

        return null;
    }
}
