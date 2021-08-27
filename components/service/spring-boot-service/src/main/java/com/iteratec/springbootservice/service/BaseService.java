package com.iteratec.springbootservice.service;

import com.iteratec.springbootservice.dto.BaseDto;
import com.iteratec.springbootservice.dto.BaseDtoFactory;
import com.iteratec.springbootservice.mapper.BaseMapper;
import com.iteratec.springbootservice.repository.BaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BaseService {
    @Autowired(required = false)
    private BaseRepository baseRepository;

    public Iterable<BaseDto> getAll() {
        if (baseRepository != null) {
            return BaseMapper.INSTANCE.toBaseDtos(baseRepository.findAll());
        }

        return BaseDtoFactory.createArray(10,10);
    }
}
