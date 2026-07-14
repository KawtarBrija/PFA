package com.somaport.backend.service;

import com.somaport.backend.domain.*;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@NoArgsConstructor
public class ContainerAllocationService {

    public AllocationDecision findAllocation(List<Place> places, ContainerType type) {
        List<Place> sorted = places.stream()
            .filter(place -> place.getState() == PlaceState.FREE)
            .sorted(Comparator.comparingInt(Place::getNumber))
            .toList();

        if (type == ContainerType.ISO20 && !sorted.isEmpty()) {
            return new AllocationDecision(List.of(sorted.get(0)));
        }

        for (int i = 0; i < sorted.size() - 1; i++) {
            Place current = sorted.get(i);
            Place next = sorted.get(i + 1);
            if (next.getNumber() - current.getNumber() == 1) {
                return new AllocationDecision(List.of(current, next));
            }
        }

        return null;
    }
}
