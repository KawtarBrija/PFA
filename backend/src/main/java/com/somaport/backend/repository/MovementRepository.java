package com.somaport.backend.repository;

import com.somaport.backend.domain.Movement;
import com.somaport.backend.domain.MovementType;
import com.somaport.backend.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface MovementRepository extends JpaRepository<Movement, Long>, JpaSpecificationExecutor<Movement> {

    List<Movement> findByUtilisateurConnecteOrderByDateHeureDesc(User utilisateurConnecte);

    java.util.Optional<Movement> findTopByContainer_IdOrderByDateHeureDesc(Long containerId);

    long countByMovementType(MovementType movementType);

    Page<Movement> findAllByOrderByDateHeureDesc(Pageable pageable);

    Page<Movement> findByUtilisateurConnecteOrderByDateHeureDesc(User utilisateurConnecte, Pageable pageable);
}

