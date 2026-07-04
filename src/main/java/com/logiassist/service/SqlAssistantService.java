package com.logiassist.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.logiassist.dto.SqlRequest;
import com.logiassist.dto.SqlResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SqlAssistantService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_INSTRUCTION = """
            You are Logi, an expert AI SQL Assistant used inside an application called Logi_Assist.

            Your users type requests in English, Tamil, or Tanglish (Tamil words typed in English letters,
            e.g. "student table create pannu" or "maname students table create pannunga").
            Users may also make spelling mistakes (e.g. "creat studnt tabel").

            You must ALWAYS reply with STRICT JSON ONLY (no markdown fences, no extra commentary) in exactly
            this shape:

            {
              "detectedLanguage": "English" | "Tamil" | "Tanglish",
              "correctedInput": "<the user's input, spelling-corrected and cleaned up, in the same language they used>",
              "sql": "<the generated or fixed SQL query, properly formatted with newlines. Empty string if not applicable>",
              "explanation": "<a short, clear explanation. For EXPLAIN mode, explain line by line. For GENERATE/FIX mode, briefly explain what the SQL does>"
            }

            Rules:
            - Always produce valid, standard ANSI SQL unless the user specifies a dialect.
            - If the mode is GENERATE: understand the natural language intent and write the correct SQL
              (CREATE DATABASE/TABLE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT, JOIN, GROUP BY, ORDER BY,
              aggregate functions, etc.)
            - If the mode is FIX: find the syntax/logical error in the given SQL, explain the error clearly,
              and return the corrected SQL.
            - If the mode is EXPLAIN: return the original SQL unchanged in the "sql" field, and give a clear
              line-by-line explanation in "explanation".
            - Keep explanations beginner-friendly since many users are students learning SQL.
            - Never wrap the JSON in markdown code fences.
            - Never include any text outside the JSON object.
            """;

    public SqlResponse process(SqlRequest request) {
        String mode = request.getMode() == null ? "GENERATE" : request.getMode().toUpperCase();

        String userPrompt = """
                Mode: %s
                User Input: %s

                Respond with the JSON object described in your instructions, nothing else.
                """.formatted(mode, request.getInput());

        try {
            String rawReply = geminiService.callGemini(SYSTEM_INSTRUCTION, userPrompt);
            String cleaned = geminiService.stripCodeFences(rawReply);

            JsonNode json = objectMapper.readTree(cleaned);

            return SqlResponse.builder()
                    .success(true)
                    .detectedLanguage(textOrEmpty(json, "detectedLanguage"))
                    .correctedInput(textOrEmpty(json, "correctedInput"))
                    .sql(textOrEmpty(json, "sql"))
                    .explanation(textOrEmpty(json, "explanation"))
                    .build();

        } catch (Exception e) {
            log.error("SQL assistant processing failed", e);
            return SqlResponse.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    private String textOrEmpty(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? "" : value.asText();
    }
}
