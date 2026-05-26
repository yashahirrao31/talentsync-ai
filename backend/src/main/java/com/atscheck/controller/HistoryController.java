package com.atscheck.controller;

import com.atscheck.model.ScanHistory;
import com.atscheck.model.User;
import com.atscheck.service.AuthService;
import com.atscheck.service.S3StorageService;
import com.atscheck.service.ScanHistoryService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final ScanHistoryService historyService;
    private final AuthService authService;
    private final S3StorageService s3StorageService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = authService.getCurrentUser(userDetails.getUsername());
        List<ScanHistory> history = historyService.getHistory(user);

        List<Map<String, Object>> result = history.stream().map(scan -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", scan.getId());
            item.put("resumeFilename", scan.getResumeFilename());
            item.put("jobTitle", scan.getJobTitle());
            item.put("atsScore", scan.getAtsScore());
            item.put("scannedAt", scan.getScannedAt());
            return item;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getScan(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = authService.getCurrentUser(userDetails.getUsername());
        ScanHistory scan = historyService.getById(id, user);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", scan.getId());
        result.put("resumeFilename", scan.getResumeFilename());
        result.put("jobTitle", scan.getJobTitle());
        result.put("atsScore", scan.getAtsScore());
        result.put("scannedAt", scan.getScannedAt());

        // Parse stored JSON report
        try {
            if (scan.getReportJson() != null) {
                result.put("report", objectMapper.readTree(scan.getReportJson()));
            }
            if (scan.getScoreBreakdownJson() != null) {
                result.put("scoreBreakdown", objectMapper.readTree(scan.getScoreBreakdownJson()));
            }
        } catch (Exception e) {
            result.put("report", null);
        }

        // Generate a fresh pre-signed download URL if S3 key exists
        if (scan.getS3Key() != null) {
            try {
                result.put("downloadUrl", s3StorageService.generatePresignedDownloadUrl(scan.getS3Key()));
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScan(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = authService.getCurrentUser(userDetails.getUsername());
        historyService.deleteScan(id, user);
        return ResponseEntity.noContent().build();
    }
}
