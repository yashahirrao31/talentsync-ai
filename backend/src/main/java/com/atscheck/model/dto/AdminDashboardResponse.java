package com.atscheck.model.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/** Data returned to the /admin/dashboard endpoint */
@Data
public class AdminDashboardResponse {

    // Summary cards
    private long totalUsers;
    private long totalScans;
    private double averageScore;
    private long highScorers;       // scans with atsScore >= 80
    private long todaySignups;
    private long todayScans;

    // Score distribution — key = range label, value = count
    // e.g. "0-40" -> 3, "40-60" -> 5, "60-70" -> 8, "70-80" -> 10, "80-90" -> 4, "90-100" -> 2
    private Map<String, Long> scoreDistribution;

    // Users list
    private List<UserSummary> users;

    // Recent scans (latest 20)
    private List<ScanSummary> recentScans;

    @Data
    public static class UserSummary {
        private String id;
        private String name;
        private String email;
        private String createdAt;
        private long scanCount;
        private Integer bestScore;
        private String lastActive;
    }

    @Data
    public static class ScanSummary {
        private String id;
        private String userName;
        private String userEmail;
        private String resumeFilename;
        private int atsScore;
        private String jobTitle;
        private String scannedAt;
    }
}
