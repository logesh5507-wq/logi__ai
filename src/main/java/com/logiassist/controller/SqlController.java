package com.logiassist.controller;

import com.logiassist.dto.SqlRequest;
import com.logiassist.dto.SqlResponse;
import com.logiassist.service.HistoryService;
import com.logiassist.service.SqlAssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sql")
@RequiredArgsConstructor
public class SqlController {

    private final SqlAssistantService sqlAssistantService;
    private final HistoryService historyService;

    /** Guest endpoint - no login required, no history saved */
    @PostMapping("/guest/process")
    public ResponseEntity<SqlResponse> processAsGuest(@Valid @RequestBody SqlRequest request) {
        SqlResponse response = sqlAssistantService.process(request);
        return ResponseEntity.ok(response);
    }

    /** Logged-in endpoint - requires JWT, automatically saves to history */
    @PostMapping("/process")
    public ResponseEntity<SqlResponse> process(@Valid @RequestBody SqlRequest request, Authentication authentication) {
        SqlResponse response = sqlAssistantService.process(request);

        if (response.isSuccess() && authentication != null) {
            String email = authentication.getName();
            historyService.save(email, request.getInput(), response.getSql(), response.getExplanation(), request.getMode());
        }

        return ResponseEntity.ok(response);
    }
}
