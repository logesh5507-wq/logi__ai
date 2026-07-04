package com.logiassist.service;

import com.opencsv.CSVReader;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Reads uploaded files (Excel, CSV, PDF, TXT) and converts their content
 * into a plain-text representation that can be handed to the AI for
 * natural-language querying.
 */
@Slf4j
@Service
public class FileParserService {

    private static final int MAX_ROWS = 500; // keep prompt size sane

    public String extractContent(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();

        if (filename.endsWith(".csv")) {
            return parseCsv(file);
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            return parseExcel(file);
        } else if (filename.endsWith(".pdf")) {
            return parsePdf(file);
        } else if (filename.endsWith(".txt")) {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        } else {
            throw new IllegalArgumentException("Unsupported file type. Use .csv, .xlsx, .xls, .pdf, or .txt");
        }
    }

    private String parseCsv(MultipartFile file) throws Exception {
        StringBuilder sb = new StringBuilder();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> rows = reader.readAll();
            int limit = Math.min(rows.size(), MAX_ROWS);
            for (int i = 0; i < limit; i++) {
                sb.append(String.join(" | ", rows.get(i))).append("\n");
            }
            if (rows.size() > MAX_ROWS) {
                sb.append("...(").append(rows.size() - MAX_ROWS).append(" more rows truncated)...\n");
            }
        }
        return sb.toString();
    }

    private String parseExcel(MultipartFile file) throws Exception {
        StringBuilder sb = new StringBuilder();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();
            int rowCount = 0;
            for (Row row : sheet) {
                if (rowCount++ >= MAX_ROWS) {
                    sb.append("...(more rows truncated)...\n");
                    break;
                }
                StringBuilder rowText = new StringBuilder();
                for (Cell cell : row) {
                    rowText.append(formatter.formatCellValue(cell)).append(" | ");
                }
                sb.append(rowText).append("\n");
            }
        }
        return sb.toString();
    }

    private String parsePdf(MultipartFile file) throws Exception {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            // limit size
            return text.length() > 20000 ? text.substring(0, 20000) + "\n...(truncated)..." : text;
        }
    }
}
