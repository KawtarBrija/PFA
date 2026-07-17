package com.somaport.backend.mapper;

import com.somaport.backend.domain.Container;
import com.somaport.backend.domain.ContainerState;
import com.somaport.backend.domain.Movement;
import com.somaport.backend.domain.MovementType;
import com.somaport.backend.domain.User;
import com.somaport.backend.dto.ReleaseDTO;
import org.springframework.stereotype.Component;

@Component
public class ReleaseMapper {

    private final MovementMapper movementMapper;

    public ReleaseMapper(MovementMapper movementMapper) {
        this.movementMapper = movementMapper;
    }

    public ReleaseDTO toDto(Container container, MovementType movementType, ContainerState exitState, User agent) {
        ReleaseDTO dto = new ReleaseDTO();
        dto.setRegistrationNumber(container.getRegistrationNumber());
        dto.setType(container.getType());
        dto.setAllocationCode(container.getAllocationCode());
        dto.setEntryDateTime(container.getEntryDateTime());
        dto.setExitDateTime(container.getExitDateTime());
        dto.setEntryState(container.getState());
        dto.setExitState(exitState);
        dto.setMovementType(movementType);
        dto.setMovementLabel(movementMapper.mapMovementLabel(movementType));
        dto.setAgentName(agent != null ? agent.getFirstName() + " " + agent.getLastName() : null);
        return dto;
    }

    public ReleaseDTO toDto(Movement exitMovement) {
        Container container = exitMovement.getContainer();
        ReleaseDTO dto = new ReleaseDTO();
        dto.setRegistrationNumber(container != null ? container.getRegistrationNumber() : null);
        dto.setType(exitMovement.getTypeIso());
        dto.setAllocationCode(exitMovement.getAllocationCode());
        dto.setEntryDateTime(container != null ? container.getEntryDateTime() : null);
        dto.setExitDateTime(exitMovement.getDateHeure());
        dto.setEntryState(container != null ? container.getState() : null);
        dto.setExitState(exitMovement.getEtat());
        dto.setMovementType(exitMovement.getMovementType());
        dto.setMovementLabel(movementMapper.mapMovementLabel(exitMovement.getMovementType()));
        dto.setAgentName(exitMovement.getUtilisateurConnecte() != null
            ? exitMovement.getUtilisateurConnecte().getFirstName() + " " + exitMovement.getUtilisateurConnecte().getLastName()
            : null);
        return dto;
    }
}
