package com.somaport.backend.service;

import com.somaport.backend.domain.*;

import com.somaport.backend.dto.ContainerResponse;
import com.somaport.backend.dto.CreateContainerRequest;
import com.somaport.backend.exception.NoAllocationAvailableException;
import com.somaport.backend.exception.ResourceNotFoundException;
import com.somaport.backend.mapper.ContainerMapper;
import com.somaport.backend.repository.BlockRepository;
import com.somaport.backend.repository.ContainerRepository;
import com.somaport.backend.repository.HistoryRepository;
import com.somaport.backend.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContainerService {

    private final ContainerRepository containerRepository;
    private final BlockRepository blockRepository;
    private final PlaceRepository placeRepository;
    private final HistoryRepository historyRepository;
    private final ContainerMapper containerMapper;
    private final ContainerAllocationService allocationService = new ContainerAllocationService();
    private final MovementService movementService;


    @Transactional
    public ContainerResponse createContainer(CreateContainerRequest request, User agent) {
        List<Place> candidatePlaces = findAvailablePlaces(request.getType());
        int requiredPlaces = request.getType() == ContainerType.ISO40 ? 2 : 1;
        if (candidatePlaces.size() != requiredPlaces) {
            throw new NoAllocationAvailableException("Aucune allocation disponible pour un conteneur " + request.getType() + ".");
        }

        Container container = new Container();
        container.setRegistrationNumber(request.getRegistrationNumber());
        container.setState(request.getState());
        container.setType(request.getType());
        container.setAgent(agent);
        container.setEntryDateTime(LocalDateTime.now());
        container.setBlock(candidatePlaces.get(0).getLine().getBlock());
        container.setLine(candidatePlaces.get(0).getLine());
        container.setPlaces(new ArrayList<>(candidatePlaces));
        container.setAllocationCode(buildAllocationCode(candidatePlaces));

        candidatePlaces.forEach(place -> place.setState(PlaceState.OCCUPIED));
        placeRepository.saveAll(candidatePlaces);
        Container saved = containerRepository.save(container);

        History history = new History();
        history.setOperation(HistoryOperation.ENTRY);

        history.setAgent(agent);

        history.setContainer(saved);
        history.setPreviousAllocation(null);
        history.setNewAllocation(saved.getAllocationCode());
        history.setDetails("Entrée de conteneur");
        historyRepository.save(history);

        // Spécification: EMPTY => ENTRY_EMPTY => libellé "ENP" ; FULL => ENTRY_FULL => libellé "Entrée Pleine"
        MovementType movementType = saved.getState() == ContainerState.FULL ? MovementType.ENTRY_FULL : MovementType.ENTRY_EMPTY;
        movementService.createMovementForContainer(saved, agent, movementType);


        log.info("Allocated container {} to {}", saved.getRegistrationNumber(), saved.getAllocationCode());
        return containerMapper.toResponse(saved);


    }

    public List<ContainerResponse> listContainers() {

        return containerRepository.findAllByOrderByEntryDateTimeDesc().stream().map(containerMapper::toResponse).toList();
    }

    public ContainerResponse getContainer(Long id) {
        return containerMapper.toResponse(containerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Container not found")));
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ContainerResponse> searchContainers(
        String query,
        ContainerType type,
        ContainerState state,
        String block,
        String line,
        LocalDateTime start,
        LocalDateTime end,
        org.springframework.data.domain.Pageable pageable
    ) {
        org.springframework.data.jpa.domain.Specification<Container> spec = (root, criteriaQuery, cb) -> cb.conjunction();

        if (query != null && !query.isBlank()) {
            String like = "%" + query.toLowerCase() + "%";
            spec = spec.and((root, criteriaQuery, cb) -> cb.or(
                cb.like(cb.lower(root.get("registrationNumber")), like),
                cb.like(cb.lower(root.get("allocationCode")), like),
                cb.like(cb.lower(cb.concat(cb.concat(root.get("agent").get("firstName"), " "), root.get("agent").get("lastName"))), like)
            ));
        }
        if (type != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.equal(root.get("type"), type));
        }
        if (state != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.equal(root.get("state"), state));
        }
        if (block != null && !block.isBlank()) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.equal(cb.lower(root.get("block").get("name")), block.toLowerCase()));
        }
        if (line != null && !line.isBlank()) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.equal(cb.lower(root.get("line").get("name")), line.toLowerCase()));
        }
        if (start != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.greaterThanOrEqualTo(root.get("entryDateTime"), start));
        }
        if (end != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.lessThanOrEqualTo(root.get("entryDateTime"), end));
        }

        return containerRepository.findAll(spec, pageable).map(containerMapper::toResponse);
    }

    private List<Place> findAvailablePlaces(ContainerType type) {
        List<Place> availablePlaces = new ArrayList<>();
        List<Block> blocks = blockRepository.findAll();
        for (Block block : blocks.stream().sorted(Comparator.comparing(Block::getName)).toList()) {
            for (Line line : block.getLines().stream().sorted(Comparator.comparing(Line::getName)).toList()) {
                List<Place> linePlaces = placeRepository.findByLine_IdOrderByNumberAsc(line.getId());
                List<Place> freePlaces = linePlaces.stream().filter(place -> place.getState() == PlaceState.FREE).toList();
                if (type == ContainerType.ISO20 && !freePlaces.isEmpty()) {
                    availablePlaces.add(freePlaces.get(0));
                    return availablePlaces;
                }
                AllocationDecision decision = allocationService.findAllocation(linePlaces, type);
                if (decision != null && !decision.getPlaces().isEmpty()) {
                    return decision.getPlaces();
                }
            }
        }
        return availablePlaces;
    }

    private String buildAllocationCode(List<Place> places) {
        if (places.size() == 1) {
            Place place = places.get(0);
            return place.getLine().getBlock().getName() + "-" + place.getLine().getName() + "-" + String.format("%03d", place.getNumber());
        }
        List<Integer> numbers = places.stream().map(Place::getNumber).sorted().toList();
        return places.get(0).getLine().getBlock().getName() + "-" + places.get(0).getLine().getName() + "-" + String.format("%03d", numbers.get(0)) + "-" + String.format("%03d", numbers.get(1));
    }
}
