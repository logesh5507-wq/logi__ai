package com.logiassist.service;

import com.logiassist.dto.FileQueryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileQueryService {

    private final GeminiService geminiService;
    private final FileParserService fileParserService;

    private static final String SYSTEM_INSTRUCTION = """
            You are Logi, an AI data assistant. The user has uploaded a data file (CSV, Excel, PDF, or TXT)
            and its raw extracted content is provided to you. The user will ask a question in English,
            Tamil, or Tanglish about that data.

            Read the data carefully, then answer the user's question accurately using ONLY the data given.
            If the data looks tabular, format your answer as a clean markdown-style table when useful.
            If the requested information isn't in the data, say so clearly.
            Keep your answer concise and directly address the question. Reply in plain text (not JSON).
            """;

    public FileQueryResponse answerFromFile(MultipartFile file, String question) {
        try {
            String content = fileParserService.extractContent(file);

            String userPrompt = """
                    FILE CONTENT:
                    %s

                    USER QUESTION: %s
                    """.formatted(content, question);

            String answer = geminiService.callGemini(SYSTEM_INSTRUCTION, userPrompt);

            return FileQueryResponse.builder()
                    .success(true)
                    .answer(answer)
                    .build();

        } catch (Exception e) {
            log.error("File query failed", e);
            return FileQueryResponse.builder()
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }
}
