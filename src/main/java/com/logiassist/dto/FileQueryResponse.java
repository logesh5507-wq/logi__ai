package com.logiassist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileQueryResponse {
    private boolean success;
    private String answer;      // AI's natural language / tabular answer
    private String errorMessage;
}
