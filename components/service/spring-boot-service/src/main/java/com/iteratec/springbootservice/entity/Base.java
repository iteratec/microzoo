package com.iteratec.springbootservice.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.persistence.*;

@Document(collection = "base")
@Entity
@Table(name = "base")
@Data
@NoArgsConstructor
public class Base {
    @Id
    private Long id;
    private String payload;
}
