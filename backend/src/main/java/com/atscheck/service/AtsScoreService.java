package com.atscheck.service;

import com.atscheck.model.dto.ResumeAnalysisResponse;
import com.atscheck.model.dto.ResumeAnalysisResponse.CategoryScore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Rule-based ATS scoring engine.
 * Evaluates resume text across 7 weighted categories.
 */
@Service
@Slf4j
public class AtsScoreService {

    // Weights (must sum to 100)
    private static final int WEIGHT_CONTACT = 10;
    private static final int WEIGHT_KEYWORDS = 30;
    private static final int WEIGHT_SECTIONS = 15;
    private static final int WEIGHT_READABILITY = 10;
    private static final int WEIGHT_BULLETS = 10;
    private static final int WEIGHT_ACTION_VERBS = 10;
    private static final int WEIGHT_QUANTIFIED = 15;

    private static final List<String> ACTION_VERBS = List.of(
            "led", "built", "designed", "developed", "managed", "implemented", "created",
            "achieved", "delivered", "improved", "increased", "reduced", "launched",
            "coordinated", "collaborated", "analyzed", "optimized", "drove", "spearheaded",
            "established", "executed", "negotiated", "mentored", "transformed", "streamlined",
            "architected", "deployed", "automated", "integrated", "scaled", "migrated"
    );

    private static final List<String> STANDARD_SECTIONS = List.of(
            "experience", "education", "skills", "summary", "objective",
            "projects", "certifications", "awards", "publications", "references"
    );

    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+?\\d[\\d\\s\\-().]{7,}\\d)");
    private static final Pattern LINKEDIN_PATTERN = Pattern.compile("linkedin\\.com/in/[a-zA-Z0-9\\-]+", Pattern.CASE_INSENSITIVE);
    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\d+%|\\d+x|\\$\\d+|\\d+\\+|\\d{4}|\\b\\d+\\s*(million|billion|thousand|k\\b)", Pattern.CASE_INSENSITIVE);
    private static final Pattern BULLET_PATTERN = Pattern.compile("^[•\\-\\*\\u2022\\u2023\\u25E6\\u2043]", Pattern.MULTILINE);

    public Map<String, CategoryScore> calculateScores(String resumeText, String jobDescription) {
        Map<String, CategoryScore> scores = new LinkedHashMap<>();
        String lowerResume = resumeText.toLowerCase();

        // 1. Contact Information
        scores.put("contact", scoreContact(resumeText, lowerResume));

        // 2. Keyword Match
        scores.put("keywords", scoreKeywords(lowerResume, jobDescription));

        // 3. Section Headings
        scores.put("sections", scoreSections(lowerResume));

        // 4. File Readability
        scores.put("readability", scoreReadability(resumeText));

        // 5. Bullet Point Usage
        scores.put("bullets", scoreBullets(resumeText));

        // 6. Action Verbs
        scores.put("actionVerbs", scoreActionVerbs(lowerResume));

        // 7. Quantified Achievements
        scores.put("quantified", scoreQuantified(resumeText));

        return scores;
    }

    public int computeTotalScore(Map<String, CategoryScore> breakdown) {
        return breakdown.values().stream()
                .mapToInt(c -> c.getScore())
                .sum();
    }

    // ─────────────────────────────────────────────────────────
    // Individual scoring methods
    // ─────────────────────────────────────────────────────────

    private CategoryScore scoreContact(String resumeText, String lower) {
        int score = 0;
        List<String> found = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        if (EMAIL_PATTERN.matcher(resumeText).find()) { score += 4; found.add("email"); }
        else missing.add("email");

        if (PHONE_PATTERN.matcher(resumeText).find()) { score += 3; found.add("phone"); }
        else missing.add("phone");

        if (LINKEDIN_PATTERN.matcher(lower).find()) { score += 3; found.add("LinkedIn"); }
        else missing.add("LinkedIn URL");

        String feedback = found.isEmpty() ? "No contact info found!" :
                "Found: " + String.join(", ", found) +
                (missing.isEmpty() ? "." : ". Missing: " + String.join(", ", missing) + ".");

        return buildScore("Contact Information", score, WEIGHT_CONTACT, feedback);
    }

    private CategoryScore scoreKeywords(String lowerResume, String jobDescription) {
        if (jobDescription == null || jobDescription.isBlank()) {
            return buildScore("Keyword Match", WEIGHT_KEYWORDS / 2, WEIGHT_KEYWORDS,
                    "No job description provided. Add one for better keyword analysis.");
        }

        String[] jdWords = jobDescription.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .split("\\s+");

        Set<String> uniqueJdKeywords = new HashSet<>();
        for (String word : jdWords) {
            if (word.length() > 3) uniqueJdKeywords.add(word);
        }

        if (uniqueJdKeywords.isEmpty()) {
            return buildScore("Keyword Match", 0, WEIGHT_KEYWORDS, "Job description had no significant keywords.");
        }

        long matched = uniqueJdKeywords.stream()
                .filter(kw -> lowerResume.contains(kw))
                .count();

        double matchPct = (double) matched / uniqueJdKeywords.size();
        int score = (int) Math.round(matchPct * WEIGHT_KEYWORDS);

        String feedback = String.format("Matched %d/%d keywords (%.0f%%).",
                matched, uniqueJdKeywords.size(), matchPct * 100);
        if (matchPct < 0.5) feedback += " Add more job-specific terms.";
        else if (matchPct >= 0.75) feedback += " Excellent keyword alignment!";

        return buildScore("Keyword Match", score, WEIGHT_KEYWORDS, feedback);
    }

    private CategoryScore scoreSections(String lower) {
        long found = STANDARD_SECTIONS.stream().filter(lower::contains).count();
        int score = (int) Math.min(WEIGHT_SECTIONS, Math.round((double) found / 5 * WEIGHT_SECTIONS));
        String feedback = found >= 5 ? "All major sections present." :
                "Found " + found + " standard sections. Consider adding: education, experience, skills.";
        return buildScore("Section Headings", score, WEIGHT_SECTIONS, feedback);
    }

    private CategoryScore scoreReadability(String resumeText) {
        int score = WEIGHT_READABILITY;
        List<String> issues = new ArrayList<>();

        // Check for garbled text patterns
        long nonAscii = resumeText.chars().filter(c -> c > 127).count();
        if ((double) nonAscii / resumeText.length() > 0.1) {
            score -= 5;
            issues.add("high non-ASCII character ratio (may indicate encoding issues)");
        }

        // Check for very long lines (tables/columns)
        long longLines = Arrays.stream(resumeText.split("\n"))
                .filter(line -> line.length() > 200)
                .count();
        if (longLines > 5) {
            score -= 3;
            issues.add("possible table/column layout (ATS unfriendly)");
        }

        score = Math.max(0, score);
        String feedback = issues.isEmpty() ? "Good readability, no encoding issues detected." :
                "Readability issues: " + String.join("; ", issues);
        return buildScore("Readability", score, WEIGHT_READABILITY, feedback);
    }

    private CategoryScore scoreBullets(String resumeText) {
        Matcher matcher = BULLET_PATTERN.matcher(resumeText);
        int bulletCount = 0;
        while (matcher.find()) bulletCount++;

        int score;
        String feedback;
        if (bulletCount >= 10) {
            score = WEIGHT_BULLETS;
            feedback = "Great use of bullet points (" + bulletCount + " found).";
        } else if (bulletCount >= 5) {
            score = 7;
            feedback = bulletCount + " bullet points found. Aim for 10+ to improve readability.";
        } else {
            score = 3;
            feedback = "Few bullet points (" + bulletCount + "). Use bullets to list achievements and responsibilities.";
        }
        return buildScore("Bullet Points", score, WEIGHT_BULLETS, feedback);
    }

    private CategoryScore scoreActionVerbs(String lowerResume) {
        long verbCount = ACTION_VERBS.stream()
                .filter(verb -> lowerResume.contains(" " + verb + " ") ||
                        lowerResume.startsWith(verb + " ") ||
                        lowerResume.contains("\n" + verb + " "))
                .count();

        int score;
        String feedback;
        if (verbCount >= 8) {
            score = WEIGHT_ACTION_VERBS;
            feedback = "Excellent action verb usage (" + verbCount + " found).";
        } else if (verbCount >= 4) {
            score = 7;
            feedback = verbCount + " action verbs found. Add more: led, built, achieved, optimized.";
        } else {
            score = 3;
            feedback = "Very few action verbs (" + verbCount + "). Start bullet points with strong action verbs.";
        }
        return buildScore("Action Verbs", score, WEIGHT_ACTION_VERBS, feedback);
    }

    private CategoryScore scoreQuantified(String resumeText) {
        Matcher matcher = NUMBER_PATTERN.matcher(resumeText);
        int count = 0;
        while (matcher.find()) count++;

        int score;
        String feedback;
        if (count >= 8) {
            score = WEIGHT_QUANTIFIED;
            feedback = "Strong quantified achievements (" + count + " metrics found).";
        } else if (count >= 4) {
            score = 10;
            feedback = count + " metrics found. Add more numbers: percentages, dollar amounts, team sizes.";
        } else {
            score = 4;
            feedback = "Very few quantified results (" + count + "). Examples: 'Increased sales by 30%', 'Managed team of 8'.";
        }
        return buildScore("Quantified Achievements", score, WEIGHT_QUANTIFIED, feedback);
    }

    private CategoryScore buildScore(String category, int score, int maxScore, String feedback) {
        CategoryScore cs = new CategoryScore();
        cs.setCategory(category);
        cs.setScore(Math.max(0, Math.min(score, maxScore)));
        cs.setMaxScore(maxScore);
        cs.setFeedback(feedback);
        return cs;
    }
}
