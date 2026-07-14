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

    @PutMapping("/{id}")
    public ResponseEntity<ContainerResponse> updateContainer(@PathVariable Long id,
                                                            @Valid @RequestBody CreateContainerRequest request) {
        return ResponseEntity.ok(containerService.updateContainer(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContainer(@PathVariable Long id) {
        containerService.deleteContainer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<ContainerResponse> releaseContainer(@PathVariable Long id,
                                                             @AuthenticationPrincipal User agent) {
        return ResponseEntity.ok(containerService.releaseContainer(id, agent));
    }
}
