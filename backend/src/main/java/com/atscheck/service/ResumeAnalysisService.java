package com.atscheck.service;

import com.atscheck.model.ScanHistory;
import com.atscheck.model.User;
import com.atscheck.model.dto.ResumeAnalysisResponse;
import com.atscheck.model.dto.ResumeAnalysisResponse.CategoryScore;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * Orchestrates the full resume analysis pipeline:
 * Parse → Score → AI Report → (S3 upload optional) → Save → Return
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeAnalysisService {

    private final ResumeParserService parserService;
    private final AtsScoreService atsScoreService;
    private final GeminiReportService geminiReportService;
    private final S3StorageService s3StorageService;
    private final ScanHistoryService scanHistoryService;
    private final ObjectMapper objectMapper;

    public ResumeAnalysisResponse analyze(
            MultipartFile file,
            String jobDescription,
            String jobTitle,
            User user
    ) {
        try {
            // Step 1: Extract text FIRST (MultipartFile stream can only be read once)
            log.info("Parsing resume text for user: {}", user.getEmail());
            String resumeText = parserService.extractText(file);
            log.info("Extracted {} characters from resume", resumeText.length());

            // Step 2: Rule-based ATS scoring
            log.info("Running ATS scoring engine...");
            Map<String, CategoryScore> scoreBreakdown = atsScoreService.calculateScores(resumeText, jobDescription);
            int totalScore = atsScoreService.computeTotalScore(scoreBreakdown);
            log.info("ATS score calculated: {}/100", totalScore);

            // Step 3: Gemini AI report
            log.info("Generating AI report via Gemini...");
            GeminiReportService.GeminiReport aiReport = geminiReportService.generateReport(
                    resumeText, jobDescription, totalScore);

            // Step 4: Build response
            ResumeAnalysisResponse response = buildResponse(
                    totalScore, scoreBreakdown, aiReport,
                    file.getOriginalFilename(), jobTitle);

            // Step 5: Upload to S3 (NON-CRITICAL — analysis already done, S3 is just for storage)
            String s3Key = null;
            try {
                log.info("Uploading resume to S3...");
                s3Key = s3StorageService.uploadResume(file, user.getId().toString());
                log.info("S3 upload successful: {}", s3Key);
            } catch (Exception s3Ex) {
                log.warn("S3 upload skipped (analysis already complete): {}", s3Ex.getMessage());
                // Analysis is already done — don't fail the request just because S3 had an issue
            }

            // Step 6: Save to history
            log.info("Saving scan to history...");
            ScanHistory saved = scanHistoryService.saveScan(
                    user, file.getOriginalFilename(), s3Key,
                    jobTitle, jobDescription, totalScore,
                    objectMapper.writeValueAsString(response),
                    objectMapper.writeValueAsString(scoreBreakdown));

            response.setScanId(saved.getId());
            log.info("Analysis complete. Score: {}/100 for user: {}", totalScore, user.getEmail());
            return response;

        } catch (Exception e) {
            log.error("Resume analysis failed for user: {}", user.getEmail(), e);
            throw new RuntimeException("Resume analysis failed: " + e.getMessage(), e);
        }
    }

    private ResumeAnalysisResponse buildResponse(
            int totalScore,
            Map<String, CategoryScore> breakdown,
            GeminiReportService.GeminiReport aiReport,
            String filename,
            String jobTitle
    ) {
        ResumeAnalysisResponse resp = new ResumeAnalysisResponse();
        resp.setAtsScore(totalScore);
        resp.setScoreBreakdown(breakdown);
        resp.setStrengths(aiReport.strengths);
        resp.setWeaknesses(aiReport.weaknesses);
        resp.setMissingKeywords(aiReport.missingKeywords);
        resp.setRecommendations(aiReport.recommendations);
        resp.setSectionFeedback(aiReport.sectionFeedback);
        resp.setRewriteSuggestions(aiReport.rewriteSuggestions);
        resp.setVerdict(aiReport.verdict);
        resp.setOverallTips(aiReport.overallTips);
        resp.setResumeFilename(filename);
        resp.setJobTitle(jobTitle);
        return resp;

    }
}
