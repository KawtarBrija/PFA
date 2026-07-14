package com.somaport.backend.service;

import com.somaport.backend.domain.ContainerType;
import com.somaport.backend.domain.PlaceState;
import com.somaport.backend.domain.Place;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ContainerAllocationServiceTest {

    private final ContainerAllocationService service = new ContainerAllocationService();

    @Test
    void shouldFindOneFreePlaceForIso20() {
        Place first = new Place();
        first.setNumber(1);
        first.setState(PlaceState.FREE);

        Place occupied = new Place();
        occupied.setNumber(2);
        occupied.setState(PlaceState.OCCUPIED);

        List<Place> places = List.of(first, occupied);

        AllocationDecision decision = service.findAllocation(places, ContainerType.ISO20);

        assertThat(decision).isNotNull();
        assertThat(decision.getPlaceNumbers()).containsExactly(1);
    }

    @Test
    void shouldFindTwoConsecutiveFreePlacesForIso40() {
        Place first = new Place();
        first.setNumber(1);
        first.setState(PlaceState.FREE);

        Place second = new Place();
        second.setNumber(2);
        second.setState(PlaceState.FREE);

        Place occupied = new Place();
        occupied.setNumber(3);
        occupied.setState(PlaceState.OCCUPIED);

        List<Place> places = List.of(first, second, occupied);

        AllocationDecision decision = service.findAllocation(places, ContainerType.ISO40);

        assertThat(decision).isNotNull();
        assertThat(decision.getPlaceNumbers()).containsExactly(1, 2);
    }

    @Test
    void shouldReturnNullWhenNoConsecutivePlacesExistForIso40() {
        Place first = new Place();
        first.setNumber(1);
        first.setState(PlaceState.FREE);

        Place second = new Place();
        second.setNumber(3);
        second.setState(PlaceState.FREE);

        List<Place> places = List.of(first, second);

        AllocationDecision decision = service.findAllocation(places, ContainerType.ISO40);

        assertThat(decision).isNull();
    }
}
