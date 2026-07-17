package com.somaport.backend.dto;

import com.somaport.backend.domain.AuditEventType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AuditLogResponse {
    private Long id;
    private AuditEventType eventType;
    private String actorName;
    private String targetEmail;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime occurredAt;
    private String details;
}
