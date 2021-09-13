package com.iteratec.springbootservice.service;

import com.iteratec.springbootservice.client.BaseClient;
import com.iteratec.springbootservice.config.MicrozooConfigProperties;
import com.iteratec.springbootservice.dto.BaseDto;
import com.iteratec.springbootservice.dto.BaseDtoFactory;
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

    public Iterable<BaseDto> getAll() {
        if (baseRepository != null) {
            return BaseMapper.INSTANCE.toBaseDtos(baseRepository.findAll());
        }

       if (baseClient != null && configProperties.getUpstreamServices() != null) {
            return getDtosFromServices(configProperties.getUpstreamServicesAsArray());
        }

        return BaseDtoFactory.createArray(10,10);
    }

    private Iterable<BaseDto> getDtosFromServices(String[] services) {
        ArrayList<BaseDto> dtos = new ArrayList<>();

        Arrays.stream(services).forEach(service -> {
            try {
                log.info("Delegating call to {}", service);
                for (BaseDto dto: baseClient.getAll(new URI(service + "/api"))) {
                    dtos.add(dto);
                }
            }
            catch (URISyntaxException exception) {
                log.warn("Syntax error in service URI {}", service);
            }
        });

        return dtos;
    }
}
