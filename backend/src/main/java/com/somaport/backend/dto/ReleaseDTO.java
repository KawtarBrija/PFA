package com.somaport.backend.dto;

import com.somaport.backend.domain.ContainerState;
import com.somaport.backend.domain.ContainerType;
import com.somaport.backend.domain.MovementType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReleaseDTO {
    private String registrationNumber;
    private ContainerType type;
    private String allocationCode;
    private LocalDateTime entryDateTime;
    private LocalDateTime exitDateTime;
    private ContainerState entryState;
    private ContainerState exitState;
    private MovementType movementType;
    private String movementLabel;
    private String agentName;
}
