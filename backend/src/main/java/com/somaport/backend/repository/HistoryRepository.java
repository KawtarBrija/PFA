package com.somaport.backend.repository;

import com.somaport.backend.domain.History;
import com.somaport.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface HistoryRepository extends JpaRepository<History, Long>, JpaSpecificationExecutor<History> {
    List<History> findAllByOrderByOccurredAtDesc();

    List<History> findByAgentOrderByOccurredAtDesc(User agent);
}
