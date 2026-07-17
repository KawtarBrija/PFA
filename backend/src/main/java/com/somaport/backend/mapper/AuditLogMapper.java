package com.somaport.backend.mapper;

import com.somaport.backend.domain.AuditLog;
import com.somaport.backend.dto.AuditLogResponse;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {
    public AuditLogResponse toResponse(AuditLog auditLog) {
        AuditLogResponse response = new AuditLogResponse();
        response.setId(auditLog.getId());
        response.setEventType(auditLog.getEventType());
        response.setActorName(auditLog.getActor() != null
            ? auditLog.getActor().getFirstName() + " " + auditLog.getActor().getLastName()
            : null);
        response.setTargetEmail(auditLog.getTargetEmail());
        response.setIpAddress(auditLog.getIpAddress());
        response.setUserAgent(auditLog.getUserAgent());
        response.setOccurredAt(auditLog.getOccurredAt());
        response.setDetails(auditLog.getDetails());
        return response;
    }
}
