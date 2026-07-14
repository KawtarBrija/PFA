package com.somaport.backend.controller;

import com.somaport.backend.domain.User;
import com.somaport.backend.dto.HistoryResponse;
import com.somaport.backend.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/histories")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @GetMapping
    public ResponseEntity<List<HistoryResponse>> listHistories(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(historyService.listHistories(currentUser));
    }
}
