package com.iteratec.springbootservice.repository.jdbc;

import com.iteratec.springbootservice.entity.Base;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BaseRepository extends CrudRepository<Base, Long> {
}
