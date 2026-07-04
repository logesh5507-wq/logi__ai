package com.logiassist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SqlResponse {
    private boolean success;
    private String detectedLanguage; // English / Tamil / Tanglish
    private String correctedInput;   // spelling-corrected version of input
    private String sql;              // final generated / fixed SQL
    private String explanation;      // line by line or general explanation
    private String errorMessage;     // populated if success = false
}
