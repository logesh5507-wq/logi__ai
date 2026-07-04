package com.logiassist.controller;

import com.logiassist.dto.HistoryDto;
import com.logiassist.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @GetMapping
    public ResponseEntity<List<HistoryDto>> getHistory(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(historyService.getHistoryForUser(email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id, Authentication authentication) {
        historyService.deleteHistoryItem(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
