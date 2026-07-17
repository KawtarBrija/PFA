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
        return createMovementForContainer(savedContainer, agent, movementType, null);
    }

    @Transactional
    public MovementResponse createMovementForContainer(Container savedContainer, User agent, MovementType movementType, ContainerState etatOverride) {
        Movement movement = new Movement();
        movement.setContainer(savedContainer);
        movement.setMovementType(movementType);
        movement.setDateHeure(LocalDateTime.now());
        movement.setUtilisateurConnecte(agent);
        movement.setAllocationCode(savedContainer.getAllocationCode());
        movement.setRemarque(null);

        movement.setEtat(etatOverride != null ? etatOverride : savedContainer.getState());
        movement.setTypeIso(savedContainer.getType());
        movement.setBloc(savedContainer.getBlock() != null ? savedContainer.getBlock().getName() : null);
        movement.setLigne(savedContainer.getLine() != null ? savedContainer.getLine().getName() : null);
        movement.setPlaces(savedContainer.getPlaces() != null && !savedContainer.getPlaces().isEmpty()
            ? savedContainer.getPlaces().stream().map(place -> String.valueOf(place.getNumber())).collect(java.util.stream.Collectors.joining(","))
            : null);

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
                                                   String query,
                                                   String label,
                                                   String agent,
                                                   LocalDateTime start,
                                                   LocalDateTime end,
                                                   Pageable pageable) {

        org.springframework.data.jpa.domain.Specification<Movement> spec = (root, criteriaQuery, cb) -> cb.conjunction();

        if (currentUser.getRole().getName() == RoleName.AGENT) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.equal(root.get("utilisateurConnecte"), currentUser));
        }

        if (query != null && !query.isBlank()) {
            String like = "%" + query.toLowerCase() + "%";
            spec = spec.and((root, criteriaQuery, cb) -> cb.or(
                cb.like(cb.lower(root.get("container").get("registrationNumber")), like),
                cb.like(cb.lower(root.get("allocationCode")), like)
            ));
        }

        if (agent != null && !agent.isBlank()) {
            String like = "%" + agent.toLowerCase() + "%";
            spec = spec.and((root, criteriaQuery, cb) -> cb.like(
                cb.lower(cb.concat(cb.concat(root.get("utilisateurConnecte").get("firstName"), " "), root.get("utilisateurConnecte").get("lastName"))), like));
        }

        List<MovementType> types = toMovementTypes(label);
        if (types != null && !types.isEmpty()) {
            spec = spec.and((root, criteriaQuery, cb) -> root.get("movementType").in(types));
        }

        if (start != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.greaterThanOrEqualTo(root.get("dateHeure"), start));
        }
        if (end != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.lessThanOrEqualTo(root.get("dateHeure"), end));
        }

        return movementRepository.findAll(spec, pageable).map(movementMapper::toResponse);
    }

    private List<MovementType> toMovementTypes(String label) {
        if (label == null || label.isBlank()) {
            return null;
        }
        return switch (label.toUpperCase()) {
            case "ENP" -> List.of(MovementType.ENTRY_FULL);
            case "ENV" -> List.of(MovementType.ENTRY_EMPTY);
            case "EXIT" -> List.of(MovementType.EXIT_FULL, MovementType.EXIT_EMPTY,
                MovementType.CHARGEMENT, MovementType.DECHARGEMENT, MovementType.AUCUN);
            default -> null;
        };
    }
}

