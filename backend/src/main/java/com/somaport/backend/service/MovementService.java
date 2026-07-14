package com.somaport.backend.service;

import com.somaport.backend.domain.*;
import com.somaport.backend.dto.MovementResponse;
import com.somaport.backend.mapper.MovementMapper;
import com.somaport.backend.repository.MovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovementService {

    private final MovementRepository movementRepository;
    private final MovementMapper movementMapper;

    @Transactional
    public MovementResponse createMovementForContainer(Container savedContainer, User agent, MovementType movementType) {
        Movement movement = new Movement();
        movement.setContainer(savedContainer);
        movement.setMovementType(movementType);
        movement.setDateHeure(LocalDateTime.now());
        movement.setUtilisateurConnecte(agent);
        movement.setAllocationCode(savedContainer.getAllocationCode());
        movement.setRemarque(null);

        movement.setEtat(savedContainer.getState());
        movement.setTypeIso(savedContainer.getType());
        movement.setBloc(savedContainer.getBlock() != null ? savedContainer.getBlock().getName() : null);
        movement.setLigne(savedContainer.getLine() != null ? savedContainer.getLine().getName() : null);
        movement.setPlaces(savedContainer.getPlaces() != null ? savedContainer.getPlaces().toString() : null);

        Movement saved = movementRepository.save(movement);
        return movementMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MovementResponse> listMovementsForCurrentUser(User currentUser) {
        List<Movement> movements = currentUser.getRole().getName() == RoleName.AGENT
            ? movementRepository.findByUtilisateurConnecteOrderByDateHeureDesc(currentUser)
            : movementRepository.findAllByOrderByDateHeureDesc(Pageable.ofSize(1000)).getContent();

        return movements.stream().map(movementMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<MovementResponse> searchMovements(User currentUser,
                                                   MovementType movementType,
                                                   LocalDateTime start,
                                                   LocalDateTime end,
                                                   Pageable pageable) {

        Page<Movement> page;
        boolean isAgent = currentUser.getRole().getName() == RoleName.AGENT;

        if (isAgent) {
            if (movementType != null && start == null && end == null) {
                page = movementRepository.findByUtilisateurConnecteAndMovementTypeOrderByDateHeureDesc(currentUser, movementType, pageable);
            } else if (movementType == null && start != null && end != null) {
                page = movementRepository.findByUtilisateurConnecteAndDateHeureBetweenOrderByDateHeureDesc(currentUser, start, end, pageable);
            } else {
                page = movementRepository.findByUtilisateurConnecteOrderByDateHeureDesc(currentUser, pageable);
            }
        } else {
            if (movementType != null && start == null && end == null) {
                page = movementRepository.findByMovementTypeOrderByDateHeureDesc(movementType, pageable);
            } else {
                page = movementRepository.findAllByOrderByDateHeureDesc(pageable);
            }
        }

        return page.map(movementMapper::toResponse);
    }
}

