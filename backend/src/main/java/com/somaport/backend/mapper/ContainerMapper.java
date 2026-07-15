package com.somaport.backend.mapper;

import com.somaport.backend.domain.Container;
import com.somaport.backend.domain.Place;
import com.somaport.backend.dto.ContainerResponse;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ContainerMapper {

    private final com.somaport.backend.repository.MovementRepository movementRepository;

    public ContainerMapper(com.somaport.backend.repository.MovementRepository movementRepository) {
        this.movementRepository = movementRepository;
    }

    public ContainerResponse toResponse(Container container) {
        ContainerResponse response = new ContainerResponse();
        response.setId(container.getId());
        response.setRegistrationNumber(container.getRegistrationNumber());
        response.setState(container.getState());
        response.setType(container.getType());
        response.setAllocationCode(container.getAllocationCode());
        response.setBlockName(container.getBlock() != null ? container.getBlock().getName() : null);
        response.setLineName(container.getLine() != null ? container.getLine().getName() : null);
        response.setPlaceNumbers(container.getPlaces().stream().map(Place::getNumber).sorted().collect(Collectors.toList()));
        response.setEntryDateTime(container.getEntryDateTime());
        response.setExitDateTime(container.getExitDateTime());

        response.setMovementLabel(movementRepository.findTopByContainer_IdOrderByDateHeureDesc(container.getId())
            .map(m -> {
                if (m.getMovementType() == null) return null;
                return switch (m.getMovementType()) {
                    case ENTRY_EMPTY -> "ENV";
                    case ENTRY_FULL -> "ENP";
                    case EXIT_FULL, EXIT_EMPTY -> "EXIT";
                };
            })
            .orElse(null));

        response.setAgentName(container.getAgent() != null ? container.getAgent().getFirstName() + " " + container.getAgent().getLastName() : null);
        return response;
    }
}
