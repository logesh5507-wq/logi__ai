package com.logiassist.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SqlRequest {

    @NotBlank(message = "Input text is required")
    private String input;

    /**
     * GENERATE - convert natural language to SQL
     * FIX      - correct broken SQL
     * EXPLAIN  - explain what a SQL query does
     */
    private String mode = "GENERATE";
}
