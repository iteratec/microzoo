package com.iteratec.springbootservice.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "base")
@Data
@NoArgsConstructor
public class Base {
    @Id
    private Long id;
    private String payload;
}
