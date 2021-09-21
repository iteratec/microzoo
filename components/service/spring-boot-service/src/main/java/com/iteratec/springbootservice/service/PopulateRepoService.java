package com.iteratec.springbootservice.service;

import com.iteratec.springbootservice.config.MicrozooConfigProperties;
import com.iteratec.springbootservice.dto.BaseDtoFactory;
import com.iteratec.springbootservice.entity.Base;
import com.iteratec.springbootservice.repository.BaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
public class PopulateRepoService {
    @Autowired(required = false)
    private BaseRepository baseRepository;

    @Autowired
    private MicrozooConfigProperties configProperties;

    @PostConstruct
    public void initData() {
        if (baseRepository != null) {
            var count = baseRepository.count();

            if (count < configProperties.getEntityCount()) {
                for (long id = count; id < configProperties.getEntityCount(); id++) {
                    Base base = new Base();
                    base.setId(id);
                    base.setPayload(BaseDtoFactory.createRandomString(configProperties.getPayloadSize()));
                    baseRepository.save(base);
                }
            }
        }
    }
}
