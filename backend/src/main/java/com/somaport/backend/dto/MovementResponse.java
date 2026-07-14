package com.somaport.backend.dto;

import com.somaport.backend.domain.MovementType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MovementResponse {

    private Long id;
    private LocalDateTime dateHeure;
    private MovementType movementType;
    private String movementLabel;

    private String matricule;
    private String etat;
    private String typeIso;
    private String bloc;
    private String ligne;
    private String places;

    private String allocationCode;
    private String remarque;

    private String agentName;
}

