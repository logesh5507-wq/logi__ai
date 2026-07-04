package com.logiassist.repository;

import com.logiassist.model.QueryHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QueryHistoryRepository extends JpaRepository<QueryHistory, Long> {
    List<QueryHistory> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    void deleteByIdAndUserEmail(Long id, String userEmail);
}
