package com.somaport.backend.service;

import com.somaport.backend.domain.RoleName;
import com.somaport.backend.domain.User;
import com.somaport.backend.dto.HistoryResponse;
import com.somaport.backend.mapper.HistoryMapper;
import com.somaport.backend.repository.HistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final HistoryRepository historyRepository;
    private final HistoryMapper historyMapper;

    public List<HistoryResponse> listHistories(User currentUser) {
        List<com.somaport.backend.domain.History> histories = currentUser.getRole().getName() == RoleName.AGENT
            ? historyRepository.findByAgentOrderByOccurredAtDesc(currentUser)
            : historyRepository.findAllByOrderByOccurredAtDesc();

        return histories.stream().map(historyMapper::toResponse).toList();
    }
}
