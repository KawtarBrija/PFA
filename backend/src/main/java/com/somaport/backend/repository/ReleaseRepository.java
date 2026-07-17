package com.somaport.backend.repository;

import com.somaport.backend.domain.Movement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ReleaseRepository extends JpaRepository<Movement, Long>, JpaSpecificationExecutor<Movement> {
}
