package com.somaport.backend.controller;

import com.somaport.backend.domain.User;
import com.somaport.backend.dto.ContainerResponse;
import com.somaport.backend.dto.CreateContainerRequest;
import com.somaport.backend.service.ContainerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/containers")
@RequiredArgsConstructor
public class ContainerController {

    private final ContainerService containerService;

    @GetMapping
    public ResponseEntity<List<ContainerResponse>> listContainers() {
        return ResponseEntity.ok(containerService.listContainers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContainerResponse> getContainer(@PathVariable Long id) {
        return ResponseEntity.ok(containerService.getContainer(id));
    }

    @PostMapping
    public ResponseEntity<ContainerResponse> createContainer(@Valid @RequestBody CreateContainerRequest request,
                                                            @AuthenticationPrincipal User agent) {
        return ResponseEntity.ok(containerService.createContainer(request, agent));
    }

    @GetMapping("/search")
    public ResponseEntity<org.springframework.data.domain.Page<ContainerResponse>> search(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) com.somaport.backend.domain.ContainerType type,
        @RequestParam(required = false) com.somaport.backend.domain.ContainerState state,
        @RequestParam(required = false) String block,
        @RequestParam(required = false) String line,
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime start,
        @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime end,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "entryDateTime,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
            ? org.springframework.data.domain.Sort.Direction.ASC
            : org.springframework.data.domain.Sort.Direction.DESC;
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, sortParts[0]));
        return ResponseEntity.ok(containerService.searchContainers(query, type, state, block, line, start, end, pageable));
    }
}
