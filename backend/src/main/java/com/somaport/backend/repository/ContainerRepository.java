package com.somaport.backend.repository;

import com.somaport.backend.domain.Container;
import com.somaport.backend.domain.ContainerState;
import com.somaport.backend.domain.ContainerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ContainerRepository extends JpaRepository<Container, Long>, JpaSpecificationExecutor<Container> {
    List<Container> findByState(ContainerState state);
    List<Container> findByType(ContainerType type);
    List<Container> findAllByOrderByEntryDateTimeDesc();
}
