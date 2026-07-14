package com.somaport.backend.dto;

import com.somaport.backend.domain.ContainerState;
import com.somaport.backend.domain.ContainerType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ContainerResponse {
    private Long id;
    private String registrationNumber;
    private ContainerState state;
    private ContainerType type;
    private String allocationCode;
    private String blockName;
    private String lineName;
    private List<Integer> placeNumbers;
    private LocalDateTime entryDateTime;
    private LocalDateTime exitDateTime;
    private String movementLabel;
    private String agentName;
}
