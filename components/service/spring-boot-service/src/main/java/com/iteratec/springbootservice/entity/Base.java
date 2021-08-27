package com.iteratec.springbootservice.entity;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "base")
@Data
public class Base {
    @Id
    private Long id;
    private String payload;
}
