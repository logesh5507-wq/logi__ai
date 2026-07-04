package com.logiassist.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "query_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    @Column(length = 2000)
    private String userInput;

    @Column(length = 4000)
    private String generatedSql;

    @Column(length = 4000)
    private String explanation;

    @Builder.Default
    private String mode = "GENERATE"; // GENERATE, FIX, EXPLAIN, FILE_QUERY

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
