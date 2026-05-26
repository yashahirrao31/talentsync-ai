package com.atscheck.service;

import com.atscheck.model.dto.ResumeAnalysisResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

/**
 * Calls Google Gemini API to generate the AI report section of the resume analysis.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiReportService {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;

    @Value("${gemini.api-url}")
    private String apiUrl;

    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            You are an expert ATS (Applicant Tracking System) analyst and career coach.
            Analyze the provided resume against the job description and return ONLY a valid JSON object.
            
            CRITICAL: Your response must be ONLY the JSON object below. No markdown, no backticks, no explanation.
            
            {
              "strengths": ["strength 1", "strength 2", "strength 3"],
              "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
              "missingKeywords": ["keyword1", "keyword2", "keyword3"],
              "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
              "sectionFeedback": {
                "Summary": "Specific feedback about the summary section",
                "Experience": "Specific feedback about the experience section",
                "Education": "Specific feedback about the education section",
                "Skills": "Specific feedback about the skills section"
              },
              "rewriteSuggestions": [
                {"original": "original bullet point text", "suggested": "improved bullet point text with metrics"},
                {"original": "another original bullet", "suggested": "improved version with action verb and result"}
              ],
              "verdict": "Strong",
              "overallTips": "2-3 sentence overall career advice based on this resume."
            }
            """;

    public GeminiReport generateReport(String resumeText, String jobDescription, int atsScore) {
        String prompt = buildPrompt(resumeText, jobDescription, atsScore);
        try {
            // Try gemini-1.5-flash first (faster, more reliable)
            String geminiResponse = callGeminiApi(prompt, "gemini-1.5-flash");
            GeminiReport report = parseGeminiResponse(geminiResponse);
            log.info("Gemini report generated successfully with gemini-1.5-flash");
            return report;
        } catch (Exception e) {
            log.warn("gemini-1.5-flash failed: {}, trying gemini-1.5-pro...", e.getMessage());
            try {
                String geminiResponse = callGeminiApi(prompt, "gemini-1.5-pro");
                GeminiReport report = parseGeminiResponse(geminiResponse);
                log.info("Gemini report generated successfully with gemini-1.5-pro");
                return report;
            } catch (Exception e2) {
                log.error("All Gemini models failed, using rule-based report. Error: {}", e2.getMessage());
                return buildRuleBasedReport(resumeText, jobDescription, atsScore);
            }
        }
    }

    private String buildPrompt(String resumeText, String jobDescription, int atsScore) {
        String jdSection = (jobDescription != null && !jobDescription.isBlank())
                ? "Job Description:\n" + jobDescription
                : "No specific job description provided. Analyze against general professional software engineering standards.";

        return SYSTEM_PROMPT + "\n\n" +
               "Current ATS Score: " + atsScore + "/100\n\n" +
               jdSection + "\n\n" +
               "Resume Text:\n" + truncate(resumeText, 6000);
    }

    private String callGeminiApi(String prompt, String modelName) {
        String url = apiUrl + "/" + modelName + ":generateContent?key=" + apiKey;

        // NOTE: Do NOT use responseMimeType for older models — causes 400 errors
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "maxOutputTokens", 4096
                )
        );

        try {
            WebClient client = WebClient.builder()
                    .codecs(config -> config.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                    .build();

            String response = client.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.debug("Raw Gemini response: {}", response != null ? response.substring(0, Math.min(200, response.length())) : "null");

            // Extract text from Gemini response — readTree throws checked JsonProcessingException
            try {
                JsonNode root = objectMapper.readTree(response);
                String text = root.path("candidates").get(0)
                        .path("content").path("parts").get(0)
                        .path("text").asText();

                if (text == null || text.isBlank()) {
                    throw new RuntimeException("Empty text response from Gemini");
                }
                return text;
            } catch (Exception parseEx) {
                throw new RuntimeException("Failed to parse Gemini API response structure: " + response, parseEx);
            }

        } catch (WebClientResponseException e) {
            log.error("Gemini HTTP error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Gemini API HTTP error: " + e.getStatusCode(), e);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }
    }

    private GeminiReport parseGeminiResponse(String jsonText) {
        try {
            // Clean up any markdown/code fences Gemini might add
            String cleaned = jsonText.trim()
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```\\s*", "")
                    .trim();

            // Find the JSON object boundaries
            int start = cleaned.indexOf('{');
            int end = cleaned.lastIndexOf('}');
            if (start >= 0 && end > start) {
                cleaned = cleaned.substring(start, end + 1);
            }

            JsonNode node = objectMapper.readTree(cleaned);
            GeminiReport report = new GeminiReport();

            report.strengths = readStringList(node, "strengths");
            report.weaknesses = readStringList(node, "weaknesses");
            report.missingKeywords = readStringList(node, "missingKeywords");
            report.recommendations = readStringList(node, "recommendations");
            report.verdict = node.path("verdict").asText("Average");
            report.overallTips = node.path("overallTips").asText("");

            // Section feedback
            report.sectionFeedback = new LinkedHashMap<>();
            JsonNode sf = node.path("sectionFeedback");
            if (sf.isObject()) {
                sf.fields().forEachRemaining(entry ->
                        report.sectionFeedback.put(entry.getKey(), entry.getValue().asText()));
            }

            // Rewrite suggestions
            report.rewriteSuggestions = new ArrayList<>();
            JsonNode rw = node.path("rewriteSuggestions");
            if (rw.isArray()) {
                for (JsonNode item : rw) {
                    ResumeAnalysisResponse.RewriteSuggestion s = new ResumeAnalysisResponse.RewriteSuggestion();
                    s.setOriginal(item.path("original").asText());
                    s.setSuggested(item.path("suggested").asText());
                    if (!s.getOriginal().isBlank()) {
                        report.rewriteSuggestions.add(s);
                    }
                }
            }

            log.info("Parsed Gemini report: verdict={}, strengths={}, weaknesses={}",
                    report.verdict, report.strengths.size(), report.weaknesses.size());
            return report;

        } catch (Exception e) {
            log.error("Failed to parse Gemini JSON, raw text: {}", jsonText.substring(0, Math.min(500, jsonText.length())), e);
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }

    /**
     * Rule-based fallback when Gemini API is unavailable.
     * Generates meaningful recommendations from the resume text itself.
     */
    private GeminiReport buildRuleBasedReport(String resumeText, String jobDescription, int score) {
        GeminiReport report = new GeminiReport();
        String text = resumeText.toLowerCase();

        // Rule-based strengths
        List<String> strengths = new ArrayList<>();
        if (text.contains("led") || text.contains("managed") || text.contains("coordinated"))
            strengths.add("Demonstrates leadership experience through active management roles");
        if (text.contains("%") || text.contains("increased") || text.contains("reduced") || text.contains("improved"))
            strengths.add("Uses quantified achievements to demonstrate impact");
        if (text.contains("java") || text.contains("python") || text.contains("javascript") || text.contains("react"))
            strengths.add("Technical skills section shows relevant programming expertise");
        if (text.contains("team") || text.contains("collaborated") || text.contains("cross-functional"))
            strengths.add("Demonstrates cross-functional collaboration and teamwork");
        if (text.contains("agile") || text.contains("scrum") || text.contains("ci/cd"))
            strengths.add("Familiarity with modern development methodologies");
        if (strengths.isEmpty()) strengths.add("Resume is well-structured and clearly written");
        if (score >= 80) strengths.add("Excellent keyword density and ATS compatibility");

        // Rule-based weaknesses
        List<String> weaknesses = new ArrayList<>();
        if (!text.contains("linkedin")) weaknesses.add("LinkedIn profile URL not found — add it to increase credibility");
        if (!text.contains("github") && !text.contains("portfolio")) weaknesses.add("No GitHub/portfolio link — add project links to showcase work");
        if (score < 70) weaknesses.add("Keyword alignment with job description can be improved");
        if (!text.contains("%") && !text.contains("million") && !text.contains("thousand"))
            weaknesses.add("Add more quantified achievements (numbers, percentages, revenue impact)");
        if (weaknesses.isEmpty()) weaknesses.add("Consider adding more industry-specific keywords from the job description");

        // Rule-based recommendations
        List<String> recommendations = new ArrayList<>();
        recommendations.add("Tailor your summary section for each job application by mirroring key phrases from the JD");
        recommendations.add("Add 2-3 quantified metrics to each experience bullet (e.g., 'Reduced build time by 40%')");
        recommendations.add("Include a dedicated Skills section with tools, frameworks, and technologies relevant to the role");
        recommendations.add("Ensure your resume is in a single-column format for maximum ATS compatibility");
        if (score < 70) recommendations.add("Use exact job title keywords from the description in your headline and experience sections");

        report.strengths = strengths;
        report.weaknesses = weaknesses;
        report.recommendations = recommendations;
        report.missingKeywords = List.of();
        report.verdict = score >= 70 ? "Strong" : score >= 50 ? "Average" : "Needs Work";
        report.overallTips = String.format(
            "Your resume scored %d/100 on ATS compatibility. %s Focus on keyword alignment and quantifying your achievements for the best results.",
            score,
            score >= 70 ? "This is a strong resume with good structure and relevant content." :
                          "With targeted improvements, you can significantly increase your interview callback rate."
        );
        report.sectionFeedback = new LinkedHashMap<>();
        report.sectionFeedback.put("Summary", "Ensure your summary includes your target job title and 2-3 key skills from the job description.");
        report.sectionFeedback.put("Experience", "Start each bullet with a strong action verb. Quantify results wherever possible.");
        report.sectionFeedback.put("Education", "List your highest degree first. Include relevant coursework or certifications.");
        report.sectionFeedback.put("Skills", "Group skills by category (Languages, Frameworks, Tools, Cloud) for better readability.");
        report.rewriteSuggestions = List.of();

        return report;
    }

    private List<String> readStringList(JsonNode node, String field) {
        List<String> list = new ArrayList<>();
        JsonNode arr = node.path(field);
        if (arr.isArray()) arr.forEach(item -> list.add(item.asText()));
        return list;
    }

    private String truncate(String text, int maxChars) {
        return text.length() > maxChars ? text.substring(0, maxChars) + "..." : text;
    }

    /** Value object for Gemini report data */
    public static class GeminiReport {
        public List<String> strengths;
        public List<String> weaknesses;
        public List<String> missingKeywords;
        public List<String> recommendations;
        public Map<String, String> sectionFeedback;
        public List<ResumeAnalysisResponse.RewriteSuggestion> rewriteSuggestions;
        public String verdict;
        public String overallTips;
    }
}
