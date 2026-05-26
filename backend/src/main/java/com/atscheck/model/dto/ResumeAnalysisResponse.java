package com.atscheck.model.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Full ATS analysis response returned to the frontend */
@Data
public class ResumeAnalysisResponse {

    private UUID scanId;
    private int atsScore;
    private Map<String, CategoryScore> scoreBreakdown;

    // AI-generated report sections
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> missingKeywords;
    private List<String> recommendations;
    private Map<String, String> sectionFeedback;
    private List<RewriteSuggestion> rewriteSuggestions;
    private String verdict;       // "Strong" | "Average" | "Needs Work"
    private String overallTips;

    // Meta
    private String resumeFilename;
    private String jobTitle;

    @Data
    public static class CategoryScore {
        private String category;
        private int score;
        private int maxScore;
        private String feedback;
    }

    @Data
    public static class RewriteSuggestion {
        private String original;
        private String suggested;
    }
}
