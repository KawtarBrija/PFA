package com.somaport.backend.service;

import com.somaport.backend.domain.*;
import com.somaport.backend.dto.DashboardResponse;
import com.somaport.backend.repository.BlockRepository;
import com.somaport.backend.repository.ContainerRepository;
import com.somaport.backend.repository.HistoryRepository;
import com.somaport.backend.repository.PlaceRepository;
import com.somaport.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ContainerRepository containerRepository;
    private final BlockRepository blockRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;

    public DashboardResponse getDashboard() {
        DashboardResponse response = new DashboardResponse();
        response.setTotalContainers(containerRepository.count());
        response.setFullContainers(containerRepository.findByState(ContainerState.FULL).size());
        response.setEmptyContainers(containerRepository.findByState(ContainerState.EMPTY).size());
        response.setIso20Count(containerRepository.findByType(ContainerType.ISO20).size());
        response.setIso40Count(containerRepository.findByType(ContainerType.ISO40).size());
        response.setBlocksCount(blockRepository.count());
        response.setFreePlaces(placeRepository.findByState(PlaceState.FREE).size());
        response.setOccupiedPlaces(placeRepository.findByState(PlaceState.OCCUPIED).size());
        response.setAgentCount(userRepository.findByRole_Name(RoleName.AGENT).size());
        response.setSupervisorCount(userRepository.findByRole_Name(RoleName.SUPERVISOR).size());

        Map<String, Long> entries = new LinkedHashMap<>();
        Map<String, Long> exits = new LinkedHashMap<>();
        List<String> labels = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String label = date.toString();
            labels.add(label);
            entries.put(label, historyRepository.findAllByOrderByOccurredAtDesc().stream()
                .filter(history -> history.getOperation() == HistoryOperation.ENTRY && history.getOccurredAt().toLocalDate().equals(date))
                .count());
            exits.put(label, historyRepository.findAllByOrderByOccurredAtDesc().stream()
                .filter(history -> history.getOperation() == HistoryOperation.EXIT && history.getOccurredAt().toLocalDate().equals(date))
                .count());
        }
        response.setDailyEntries(entries);
        response.setDailyExits(exits);
        response.setLabels(labels);
        return response;
    }
}
