package com.logiassist.controller;

import com.logiassist.dto.FileQueryResponse;
import com.logiassist.service.FileQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FileController {

    private final FileQueryService fileQueryService;

    @PostMapping(value = "/query", consumes = "multipart/form-data")
    public ResponseEntity<FileQueryResponse> queryFile(
            @RequestPart("file") MultipartFile file,
            @RequestPart("question") String question) {

        FileQueryResponse response = fileQueryService.answerFromFile(file, question);
        return ResponseEntity.ok(response);
    }
}
