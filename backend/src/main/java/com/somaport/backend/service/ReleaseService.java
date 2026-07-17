package com.somaport.backend.service;

import com.somaport.backend.domain.*;
import com.somaport.backend.dto.ReleaseDTO;
import com.somaport.backend.dto.ReleaseRequest;
import com.somaport.backend.exception.ConflictException;
import com.somaport.backend.exception.ResourceNotFoundException;
import com.somaport.backend.mapper.ReleaseMapper;
import com.somaport.backend.repository.ContainerRepository;
import com.somaport.backend.repository.HistoryRepository;
import com.somaport.backend.repository.PlaceRepository;
import com.somaport.backend.repository.ReleaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReleaseService {

    private final ContainerRepository containerRepository;
    private final PlaceRepository placeRepository;
    private final HistoryRepository historyRepository;
    private final ReleaseRepository releaseRepository;
    private final MovementService movementService;
    private final ReleaseMapper releaseMapper;

    private static final List<MovementType> EXIT_TYPES = List.of(
        MovementType.CHARGEMENT, MovementType.DECHARGEMENT, MovementType.AUCUN
    );

    @Transactional
    public ReleaseDTO release(ReleaseRequest request, User agent) {
        Container container = containerRepository.findByRegistrationNumber(request.getRegistrationNumber())
            .orElseThrow(() -> new ResourceNotFoundException("Impossible de libérer un conteneur qui n'a jamais été enregistré."));

        if (container.getExitDateTime() != null) {
            throw new ConflictException("Ce conteneur n'est pas présent dans le parc.");
        }

        ContainerState entryState = container.getState();
        ContainerState exitState = request.getExitState();
        MovementType movementType = determineMovementType(entryState, exitState);

        container.setExitDateTime(LocalDateTime.now());

        // Movement + response DTO must be built while the allocation/bloc/ligne/places snapshot is still intact.
        movementService.createMovementForContainer(container, agent, movementType, exitState);
        ReleaseDTO response = releaseMapper.toDto(container, movementType, exitState, agent);

        String previousAllocation = container.getAllocationCode();

        container.getPlaces().forEach(place -> place.setState(PlaceState.FREE));
        placeRepository.saveAll(container.getPlaces());
        container.getPlaces().clear();
        container.setBlock(null);
        container.setLine(null);
        container.setAllocationCode(null);
        Container saved = containerRepository.save(container);

        History history = new History();
        history.setOperation(HistoryOperation.EXIT);
        history.setAgent(agent);
        history.setContainer(saved);
        history.setPreviousAllocation(previousAllocation);
        history.setNewAllocation(null);
        history.setDetails("Sortie de conteneur");
        historyRepository.save(history);

        return response;
    }

    @Transactional(readOnly = true)
    public Page<ReleaseDTO> search(User currentUser,
                                    String query,
                                    String label,
                                    String agent,
                                    LocalDateTime start,
                                    LocalDateTime end,
                                    Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Movement> spec =
            (root, criteriaQuery, cb) -> root.get("movementType").in(EXIT_TYPES);

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

        MovementType movementType = toMovementType(label);
        if (movementType != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.equal(root.get("movementType"), movementType));
        }

        if (start != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.greaterThanOrEqualTo(root.get("dateHeure"), start));
        }
        if (end != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.lessThanOrEqualTo(root.get("dateHeure"), end));
        }

        return releaseRepository.findAll(spec, pageable).map(releaseMapper::toDto);
    }

    private MovementType determineMovementType(ContainerState entryState, ContainerState exitState) {
        if (entryState == ContainerState.EMPTY && exitState == ContainerState.FULL) {
            return MovementType.CHARGEMENT;
        }
        if (entryState == ContainerState.FULL && exitState == ContainerState.EMPTY) {
            return MovementType.DECHARGEMENT;
        }
        return MovementType.AUCUN;
    }

    private MovementType toMovementType(String label) {
        if (label == null || label.isBlank()) {
            return null;
        }
        return switch (label.toUpperCase()) {
            case "CHARGEMENT" -> MovementType.CHARGEMENT;
            case "DECHARGEMENT" -> MovementType.DECHARGEMENT;
            case "AUCUN" -> MovementType.AUCUN;
            default -> null;
        };
    }
}
