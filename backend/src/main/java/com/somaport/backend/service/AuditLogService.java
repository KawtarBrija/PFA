package com.somaport.backend.service;

import com.somaport.backend.domain.AuditEventType;
import com.somaport.backend.domain.AuditLog;
import com.somaport.backend.domain.User;
import com.somaport.backend.dto.AuditLogResponse;
import com.somaport.backend.mapper.AuditLogMapper;
import com.somaport.backend.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> search(String query, String eventType, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        Specification<AuditLog> spec = (root, criteriaQuery, cb) -> cb.conjunction();

        if (query != null && !query.isBlank()) {
            String like = "%" + query.toLowerCase() + "%";
            spec = spec.and((root, criteriaQuery, cb) -> cb.or(
                cb.like(cb.lower(root.get("targetEmail")), like),
                cb.like(cb.lower(root.get("ipAddress")), like),
                cb.like(cb.lower(root.get("details")), like),
                cb.like(cb.lower(cb.concat(cb.concat(root.get("actor").get("firstName"), " "), root.get("actor").get("lastName"))), like)
            ));
        }

        if (eventType != null && !eventType.isBlank()) {
            try {
                AuditEventType parsed = AuditEventType.valueOf(eventType.toUpperCase());
                spec = spec.and((root, criteriaQuery, cb) -> cb.equal(root.get("eventType"), parsed));
            } catch (IllegalArgumentException ignored) {
                // unknown filter value: ignore instead of failing the search
            }
        }

        if (start != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.greaterThanOrEqualTo(root.get("occurredAt"), start));
        }
        if (end != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.lessThanOrEqualTo(root.get("occurredAt"), end));
        }

        return auditLogRepository.findAll(spec, pageable).map(auditLogMapper::toResponse);
    }

    @Transactional
    public void log(AuditEventType eventType, User actor, String targetEmail, HttpServletRequest request, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setEventType(eventType);
        auditLog.setActor(actor);
        auditLog.setTargetEmail(targetEmail);
        auditLog.setDetails(details);
        if (request != null) {
            auditLog.setIpAddress(resolveIp(request));
            auditLog.setUserAgent(request.getHeader("User-Agent"));
        }
        auditLogRepository.save(auditLog);
    }

    private String resolveIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
