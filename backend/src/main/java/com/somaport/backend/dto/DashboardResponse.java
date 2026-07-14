package com.somaport.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class DashboardResponse {
    private long totalContainers;
    private long fullContainers;
    private long emptyContainers;
    private long iso20Count;
    private long iso40Count;
    private long blocksCount;
    private long freePlaces;
    private long occupiedPlaces;
    private long agentCount;
    private long supervisorCount;
    private Map<String, Long> dailyEntries;
    private Map<String, Long> dailyExits;
    private List<String> labels;
}
