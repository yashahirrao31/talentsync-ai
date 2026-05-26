package com.atscheck.service;

import com.atscheck.model.ScanHistory;
import com.atscheck.model.User;
import com.atscheck.repository.ScanHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScanHistoryService {

    private final ScanHistoryRepository scanHistoryRepository;
    private final S3StorageService s3StorageService;

    public ScanHistory saveScan(User user, String filename, String s3Key,
                                String jobTitle, String jobDescription,
                                int score, String reportJson, String scoreBreakdownJson) {
        ScanHistory history = ScanHistory.builder()
                .user(user)
                .resumeFilename(filename)
                .s3Key(s3Key)
                .jobTitle(jobTitle)
                .jobDescription(jobDescription)
                .atsScore(score)
                .reportJson(reportJson)
                .scoreBreakdownJson(scoreBreakdownJson)
                .build();

        return scanHistoryRepository.save(history);
    }

    public List<ScanHistory> getHistory(User user) {
        return scanHistoryRepository.findByUserOrderByScannedAtDesc(user);
    }

    public ScanHistory getById(UUID id, User user) {
        return scanHistoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Scan not found or access denied"));
    }

    @Transactional
    public void deleteScan(UUID id, User user) {
        ScanHistory scan = getById(id, user);
        // Clean up S3
        if (scan.getS3Key() != null) {
            s3StorageService.deleteResume(scan.getS3Key());
        }
        scanHistoryRepository.deleteByIdAndUser(id, user);
    }

    public long countScans(User user) {
        return scanHistoryRepository.countByUser(user);
    }
}
