package com.iteratec.springbootservice.service;

import com.iteratec.springbootservice.client.BaseClient;
import com.iteratec.springbootservice.config.MicrozooConfigProperties;
import com.iteratec.springbootservice.dto.BaseDto;
import com.iteratec.springbootservice.dto.BaseDtoFactory;
import com.iteratec.springbootservice.entity.Base;
import com.iteratec.springbootservice.mapper.BaseMapper;
import com.iteratec.springbootservice.repository.BaseRepositoryProxy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;

@Service
@Slf4j
public class BaseService {
    private final BaseRepositoryProxy baseRepositoryProxy;
    private final BaseClient baseClient;
    private final MicrozooConfigProperties configProperties;

    @Autowired(required = false)
    BaseService(BaseRepositoryProxy baseRepositoryProxy, BaseClient baseClient, MicrozooConfigProperties configProperties) {
        this.baseRepositoryProxy = baseRepositoryProxy;
        this.baseClient = baseClient;
        this.configProperties = configProperties;
    }

    private boolean isUpstreamValid() {
        return baseClient != null && configProperties.getUpstreamServices() != null;
    }

    private URI getServiceUri(String service) throws URISyntaxException {
        return new URI(service + "/api");
    }

    public Iterable<BaseDto> getAll() {
        if (baseRepositoryProxy.getRepository() != null) {
            log.info("Fetching entities from repository");
            return BaseMapper.INSTANCE.toBaseDtos(baseRepositoryProxy.getRepository().findAll());
        }

       if (isUpstreamValid()) {
           log.info("Fetching entities from upstream services");
           return getFromServices(configProperties.getUpstreamServicesAsArray());
        }

        return BaseDtoFactory.createArray(configProperties.getEntityCount(),configProperties.getPayloadSize());
    }

    private Iterable<BaseDto> getFromServices(String[] services) {
        ArrayList<BaseDto> dtos = new ArrayList<>();

        for (String service: services) {
            try {
                log.info("Delegating call to {}", service);
                for (BaseDto dto: baseClient.getAll(getServiceUri(service))) {
                    dtos.add(dto);
                }
            }
            catch (URISyntaxException exception) {
                log.warn("Syntax error in service URI {}", service);
            }
        }

        return dtos;
    }

    public BaseDto create(BaseDto baseDto) {
        if (baseRepositoryProxy.getRepository() != null) {
            Base base = BaseMapper.INSTANCE.toBase(baseDto);
            log.info("Saving entity with id {} in repository", base.getId());
            Base result = baseRepositoryProxy.getRepository().save(base);
            return BaseMapper.INSTANCE.toBaseDto(result);
        }

        if (isUpstreamValid()) {
            log.info("Posting dto with id {} to upstream services", baseDto.getId());
            return postToServices(configProperties.getUpstreamServicesAsArray(), baseDto);
        }

        return null;
    }

    private BaseDto postToServices(String[] services, BaseDto baseDto) {
        BaseDto result = null;

        for (String service: services) {
            try {
                log.info("Posting dto with id {} to service {}", baseDto.getId(), service);
                result = baseClient.create(getServiceUri(service), baseDto);
            }
            catch (URISyntaxException exception) {
                log.warn("Syntax error in service URI {}", service);
            }
        }

        return result;
    }
}
