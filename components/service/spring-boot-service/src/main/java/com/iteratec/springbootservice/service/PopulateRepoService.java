package com.iteratec.springbootservice.service;

import com.iteratec.springbootservice.config.MicrozooConfigProperties;
import com.iteratec.springbootservice.dto.BaseDtoFactory;
import com.iteratec.springbootservice.entity.Base;
import com.iteratec.springbootservice.repository.BaseRepositoryProxy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Slf4j
@Service
@RequiredArgsConstructor
public class PopulateRepoService {
    private final BaseRepositoryProxy baseRepositoryProxy;
    private final MicrozooConfigProperties configProperties;

    @PostConstruct
    public void initData() {
        if (baseRepositoryProxy.getRepository() != null) {
            var count = baseRepositoryProxy.getRepository().count();

            if (count < configProperties.getEntityCount()) {
                log.info("creating {} entities with payload size {} in database",
                        configProperties.getEntityCount() - count,
                        configProperties.getPayloadSize());
                for (long id = count; id < configProperties.getEntityCount(); id++) {
                    Base base = new Base();
                    base.setId(id);
                    base.setPayload(BaseDtoFactory.createRandomString(configProperties.getPayloadSize()));
                    baseRepositoryProxy.getRepository().save(base);
                }
            }
        }
    }
}
