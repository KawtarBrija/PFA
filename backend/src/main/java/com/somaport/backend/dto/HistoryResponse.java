package com.somaport.backend.dto;

import com.somaport.backend.domain.HistoryOperation;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class HistoryResponse {
    private Long id;
    private HistoryOperation operation;
    private String containerState;
    private String containerTypeIso;
    private String allocation;
    private String movementType;
    private String movementLabel;
    private LocalDateTime occurredAt;
    private String agentName;
    private String containerRegistrationNumber;
    private String previousAllocation;
    private String newAllocation;
    private String details;
}
