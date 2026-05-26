package com.atscheck.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "scan_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String resumeFilename;

    @Column
    private String s3Key;  // S3 object key for the uploaded resume

    @Column
    private String jobTitle;

    @Column(length = 5000)
    private String jobDescription;

    @Column(nullable = false)
    private Integer atsScore;

    @Column(columnDefinition = "TEXT")
    private String reportJson;  // Full AI report stored as JSON string

    @Column(columnDefinition = "TEXT")
    private String scoreBreakdownJson;  // Per-category scores as JSON

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime scannedAt;
}
