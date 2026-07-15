package com.somaport.backend.mapper;

import com.somaport.backend.domain.Movement;
import com.somaport.backend.domain.MovementType;
import com.somaport.backend.dto.MovementResponse;
import org.springframework.stereotype.Component;

@Component
public class MovementMapper {

    public MovementResponse toResponse(Movement movement) {
        MovementResponse response = new MovementResponse();
        response.setId(movement.getId());
        response.setDateHeure(movement.getDateHeure());
        response.setMovementType(movement.getMovementType());
        response.setMovementLabel(mapMovementLabel(movement.getMovementType()));

        response.setAllocationCode(movement.getAllocationCode());
        response.setRemarque(movement.getRemarque());

        response.setBloc(movement.getBloc());
        response.setLigne(movement.getLigne());
        response.setPlaces(movement.getPlaces());

        response.setEtat(movement.getEtat() != null ? movement.getEtat().name() : null);
        response.setTypeIso(movement.getTypeIso() != null ? movement.getTypeIso().name() : null);

        response.setMatricule(movement.getContainer() != null ? movement.getContainer().getRegistrationNumber() : null);

        response.setAgentName(movement.getUtilisateurConnecte() != null
            ? movement.getUtilisateurConnecte().getFirstName() + " " + movement.getUtilisateurConnecte().getLastName()
            : null);

        return response;
    }

    private String mapMovementLabel(MovementType movementType) {
        if (movementType == null) return null;
        return switch (movementType) {
            case ENTRY_EMPTY -> "ENV";
            case ENTRY_FULL -> "ENP";
            case EXIT_FULL, EXIT_EMPTY -> "EXIT";
        };
    }
}


