package com.somaport.backend.service;

import com.somaport.backend.domain.ContainerState;
import com.somaport.backend.domain.History;
import com.somaport.backend.domain.HistoryOperation;
import com.somaport.backend.domain.RoleName;
import com.somaport.backend.domain.User;
import com.somaport.backend.dto.HistoryResponse;
import com.somaport.backend.mapper.HistoryMapper;
import com.somaport.backend.repository.HistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final HistoryRepository historyRepository;
    private final HistoryMapper historyMapper;

    public List<HistoryResponse> listHistories(User currentUser) {
        List<History> histories = currentUser.getRole().getName() == RoleName.AGENT
            ? historyRepository.findByAgentOrderByOccurredAtDesc(currentUser)
            : historyRepository.findAllByOrderByOccurredAtDesc();

        return histories.stream().map(historyMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<HistoryResponse> searchHistories(User currentUser,
                                                  String query,
                                                  String label,
                                                  LocalDateTime start,
                                                  LocalDateTime end,
                                                  Pageable pageable) {

        Specification<History> spec = (root, criteriaQuery, cb) -> cb.conjunction();

        if (currentUser.getRole().getName() == RoleName.AGENT) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.equal(root.get("agent"), currentUser));
        }

        if (query != null && !query.isBlank()) {
            String like = "%" + query.toLowerCase() + "%";
            spec = spec.and((root, criteriaQuery, cb) -> cb.or(
                cb.like(cb.lower(root.get("container").get("registrationNumber")), like),
                cb.like(cb.lower(root.get("newAllocation")), like),
                cb.like(cb.lower(root.get("previousAllocation")), like),
                cb.like(cb.lower(cb.concat(cb.concat(root.get("agent").get("firstName"), " "), root.get("agent").get("lastName"))), like)
            ));
        }

        if (label != null && !label.isBlank()) {
            switch (label.toUpperCase()) {
                case "ENP" -> spec = spec.and((root, criteriaQuery, cb) -> cb.and(
                    cb.equal(root.get("operation"), HistoryOperation.ENTRY),
                    cb.equal(root.get("container").get("state"), ContainerState.FULL)));
                case "ENV" -> spec = spec.and((root, criteriaQuery, cb) -> cb.and(
                    cb.equal(root.get("operation"), HistoryOperation.ENTRY),
                    cb.equal(root.get("container").get("state"), ContainerState.EMPTY)));
                case "EXIT" -> spec = spec.and((root, criteriaQuery, cb) -> cb.equal(root.get("operation"), HistoryOperation.EXIT));
                default -> { }
            }
        }

        if (start != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.greaterThanOrEqualTo(root.get("occurredAt"), start));
        }
        if (end != null) {
            spec = spec.and((root, criteriaQuery, cb) -> cb.lessThanOrEqualTo(root.get("occurredAt"), end));
        }

        return historyRepository.findAll(spec, pageable).map(historyMapper::toResponse);
    }
}
