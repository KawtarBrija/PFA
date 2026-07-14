package com.somaport.backend.repository;

import com.somaport.backend.domain.Container;
import com.somaport.backend.domain.ContainerState;
import com.somaport.backend.domain.ContainerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContainerRepository extends JpaRepository<Container, Long> {
    List<Container> findByState(ContainerState state);
    List<Container> findByType(ContainerType type);
    List<Container> findAllByOrderByEntryDateTimeDesc();
}
