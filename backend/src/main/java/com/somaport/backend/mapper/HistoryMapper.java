package com.somaport.backend.mapper;

import com.somaport.backend.domain.History;
import com.somaport.backend.dto.HistoryResponse;
import org.springframework.stereotype.Component;

@Component
public class HistoryMapper {
    public HistoryResponse toResponse(History history) {
        HistoryResponse response = new HistoryResponse();
        response.setId(history.getId());
        response.setOperation(history.getOperation());
        response.setOccurredAt(history.getOccurredAt());
        response.setAgentName(history.getAgent() != null ? history.getAgent().getFirstName() + " " + history.getAgent().getLastName() : null);

        response.setContainerRegistrationNumber(history.getContainer() != null ? history.getContainer().getRegistrationNumber() : null);
        response.setPreviousAllocation(history.getPreviousAllocation());
        response.setNewAllocation(history.getNewAllocation());
        response.setDetails(history.getDetails());

        response.setContainerState(history.getContainer() != null && history.getContainer().getState() != null ? history.getContainer().getState().name() : null);
        response.setContainerTypeIso(history.getContainer() != null && history.getContainer().getType() != null ? history.getContainer().getType().name() : null);

        response.setAllocation(history.getOperation() == com.somaport.backend.domain.HistoryOperation.ENTRY ? history.getNewAllocation() : history.getPreviousAllocation());

        // Mouvement (si disponible) : on se base sur le label d’entrée/sortie déduit du state courant.
        if (history.getContainer() != null && history.getContainer().getState() != null) {
            response.setMovementType(
                history.getOperation() == com.somaport.backend.domain.HistoryOperation.ENTRY
                    ? (history.getContainer().getState() == com.somaport.backend.domain.ContainerState.FULL
                        ? com.somaport.backend.domain.MovementType.ENTRY_FULL.name()
                        : com.somaport.backend.domain.MovementType.ENTRY_EMPTY.name())
                    : com.somaport.backend.domain.MovementType.EXIT_EMPTY.name()
            );

            response.setMovementLabel(
                history.getOperation() == com.somaport.backend.domain.HistoryOperation.ENTRY
                    ? (history.getContainer().getState() == com.somaport.backend.domain.ContainerState.FULL ? "ENP" : "ENV")
                    : "EXIT"
            );
        }

        return response;
    }
}
