package com.iteratec.springbootservice.mapper;

import com.iteratec.springbootservice.dto.BaseDto;
import com.iteratec.springbootservice.entity.Base;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface BaseMapper {
    BaseMapper INSTANCE = Mappers.getMapper( BaseMapper.class );

    BaseDto toBaseDto(Base base);
    Iterable<BaseDto> toBaseDtos(Iterable<Base> bases);
    Base toBase(BaseDto baseDto);
    Iterable<Base> toBases(Iterable<BaseDto> baseDtos);
}
