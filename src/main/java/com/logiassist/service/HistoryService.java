package com.logiassist.service;

import com.logiassist.dto.HistoryDto;
import com.logiassist.model.QueryHistory;
import com.logiassist.repository.QueryHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final QueryHistoryRepository historyRepository;

    public void save(String userEmail, String userInput, String sql, String explanation, String mode) {
        QueryHistory history = QueryHistory.builder()
                .userEmail(userEmail)
                .userInput(userInput)
                .generatedSql(sql)
                .explanation(explanation)
                .mode(mode)
                .build();
        historyRepository.save(history);
    }

    public List<HistoryDto> getHistoryForUser(String userEmail) {
        return historyRepository.findByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(h -> HistoryDto.builder()
                        .id(h.getId())
                        .userInput(h.getUserInput())
                        .generatedSql(h.getGeneratedSql())
                        .mode(h.getMode())
                        .createdAt(h.getCreatedAt())
                        .build())
                .toList();
    }

    public void deleteHistoryItem(Long id, String userEmail) {
        historyRepository.deleteByIdAndUserEmail(id, userEmail);
    }
}
