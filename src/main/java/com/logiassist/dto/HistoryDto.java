package com.logiassist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryDto {
    private Long id;
    private String userInput;
    private String generatedSql;
    private String mode;
    private LocalDateTime createdAt;
}
