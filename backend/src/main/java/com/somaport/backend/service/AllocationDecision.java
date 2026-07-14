package com.somaport.backend.service;

import com.somaport.backend.domain.Place;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class AllocationDecision {
    private final List<Place> places;

    public AllocationDecision(List<Place> places) {
        this.places = new ArrayList<>(places);
    }

    public List<Integer> getPlaceNumbers() {
        return places.stream().map(Place::getNumber).sorted().collect(Collectors.toList());
    }
}
