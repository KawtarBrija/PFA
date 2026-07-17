package com.somaport.backend.controller;

import com.somaport.backend.domain.User;
import com.somaport.backend.dto.ReleaseDTO;
import com.somaport.backend.dto.ReleaseRequest;
import com.somaport.backend.service.ReleaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/releases")
@RequiredArgsConstructor
public class ReleaseController {

    private final ReleaseService releaseService;

    @PostMapping
    public ResponseEntity<ReleaseDTO> release(@Valid @RequestBody ReleaseRequest request,
                                               @AuthenticationPrincipal User agent) {
        return ResponseEntity.ok(releaseService.release(request, agent));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ReleaseDTO>> search(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) String label,
        @RequestParam(required = false) String agent,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "dateHeure,desc") String sort,
        @AuthenticationPrincipal User currentUser
    ) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));
        return ResponseEntity.ok(releaseService.search(currentUser, query, label, agent, start, end, pageable));
    }
}
