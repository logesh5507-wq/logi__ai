package com.logiassist.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Handles all communication with Google's Gemini API.
 * Responsible for turning natural language (English / Tamil / Tanglish)
 * into SQL, fixing broken SQL, explaining SQL, and answering questions
 * about uploaded file data.
 */
@Slf4j
@Service
public class GeminiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Calls Gemini with a system instruction + user prompt and returns the raw text reply.
     */
    public String callGemini(String systemInstruction, String userPrompt) {

        if (!isConfiguredApiKey(apiKey)) {
            throw new IllegalStateException(
                    "Gemini API key not configured. Add it in application.properties (gemini.api.key) " +
                    "or set the GEMINI_API_KEY environment variable. Get a free key at https://aistudio.google.com/apikey"
            );
        }

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> systemPart = new HashMap<>();
        systemPart.put("parts", new Object[]{ Map.of("text", systemInstruction) });
        requestBody.put("system_instruction", systemPart);

        Map<String, Object> userContent = new HashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", new Object[]{ Map.of("text", userPrompt) });
        requestBody.put("contents", new Object[]{ userContent });

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.2);
        generationConfig.put("maxOutputTokens", 2048);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String response = restTemplate.postForObject(apiUrl, entity, String.class);
            return extractTextFromResponse(response);
        } catch (HttpClientErrorException e) {
            log.error("Gemini API error: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Gemini API request failed: " + e.getStatusCode() +
                    ". Check that your API key is valid. Details: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Gemini call failed", e);
            throw new RuntimeException("Failed to reach Gemini API: " + e.getMessage());
        }
    }

    private boolean isConfiguredApiKey(String key) {
        return key != null && !key.isBlank() && !key.equals("PASTE_YOUR_GEMINI_API_KEY_HERE");
    }

    private String extractTextFromResponse(String rawJson) throws Exception {
        JsonNode root = objectMapper.readTree(rawJson);
        JsonNode candidates = root.path("candidates");
        if (candidates.isMissingNode() || candidates.isEmpty()) {
            throw new RuntimeException("Gemini returned no candidates. Raw response: " + rawJson);
        }
        JsonNode parts = candidates.get(0).path("content").path("parts");
        StringBuilder sb = new StringBuilder();
        for (JsonNode part : parts) {
            if (part.has("text")) {
                sb.append(part.get("text").asText());
            }
        }
        return sb.toString().trim();
    }

    /** Strips markdown code fences ```json ... ``` that Gemini sometimes wraps around JSON output */
    public String stripCodeFences(String text) {
        String cleaned = text.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("^```(json)?", "").trim();
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3).trim();
            }
        }
        return cleaned;
    }
}
