package com.somaport.backend.repository;

import com.somaport.backend.domain.Movement;
import com.somaport.backend.domain.MovementType;
import com.somaport.backend.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MovementRepository extends JpaRepository<Movement, Long> {

    List<Movement> findByUtilisateurConnecteOrderByDateHeureDesc(User utilisateurConnecte);

    java.util.Optional<Movement> findTopByContainer_IdOrderByDateHeureDesc(Long containerId);


    long countByMovementType(MovementType movementType);

    Page<Movement> findAllByOrderByDateHeureDesc(Pageable pageable);

    Page<Movement> findByUtilisateurConnecteOrderByDateHeureDesc(User utilisateurConnecte, Pageable pageable);

    Page<Movement> findByMovementTypeOrderByDateHeureDesc(MovementType movementType, Pageable pageable);

    Page<Movement> findByUtilisateurConnecteAndMovementTypeOrderByDateHeureDesc(User utilisateurConnecte, MovementType movementType, Pageable pageable);

    Page<Movement> findByUtilisateurConnecteAndDateHeureBetweenOrderByDateHeureDesc(User utilisateurConnecte, LocalDateTime start, LocalDateTime end, Pageable pageable);
}

