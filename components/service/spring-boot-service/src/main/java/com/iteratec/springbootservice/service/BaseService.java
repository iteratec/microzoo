package com.iteratec.springbootservice.service;

import com.iteratec.springbootservice.client.BaseClient;
import com.iteratec.springbootservice.config.MicrozooConfigProperties;
import com.iteratec.springbootservice.dto.BaseDto;
import com.iteratec.springbootservice.dto.BaseDtoFactory;
import com.iteratec.springbootservice.entity.Base;
import com.iteratec.springbootservice.mapper.BaseMapper;
import com.iteratec.springbootservice.repository.BaseRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;

@Service
@Slf4j
public class BaseService {
    @Autowired(required = false)
    private BaseRepository baseRepository;

    @Autowired(required = false)
    private BaseClient baseClient;

    @Autowired
    private MicrozooConfigProperties configProperties;

    private boolean isUpstreamValid() {
        return baseClient != null && configProperties.getUpstreamServices() != null;
    }

    private URI getServiceUri(String service) throws URISyntaxException {
        return new URI(service + "/api");
    }

    public Iterable<BaseDto> getAll() {
        if (baseRepository != null) {
            log.info("Fetching entities from repository");
            return BaseMapper.INSTANCE.toBaseDtos(baseRepository.findAll());
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
        if (baseRepository != null) {
            log.info("Saving entity in repository");
            Base result = baseRepository.save(BaseMapper.INSTANCE.toBase(baseDto));
            return BaseMapper.INSTANCE.toBaseDto(result);
        }

        if (isUpstreamValid()) {
            log.info("Posting entity to upstream services");
            return postToServices(configProperties.getUpstreamServicesAsArray(), baseDto);
        }

        return null;
    }

    private BaseDto postToServices(String[] services, BaseDto baseDto) {
        BaseDto result = null;

        for (String service: services) {
            try {
                result = baseClient.create(getServiceUri(service), baseDto);
            }
            catch (URISyntaxException exception) {
                log.warn("Syntax error in service URI {}", service);
            }
        }

        return result;
    }
}
