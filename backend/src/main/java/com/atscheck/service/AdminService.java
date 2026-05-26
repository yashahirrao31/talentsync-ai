package com.atscheck.service;

import com.atscheck.model.ScanHistory;
import com.atscheck.model.User;
import com.atscheck.model.dto.AdminDashboardResponse;
import com.atscheck.model.dto.AdminDashboardResponse.*;
import com.atscheck.repository.ScanHistoryRepository;
import com.atscheck.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final ScanHistoryRepository scanHistoryRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    public AdminDashboardResponse getDashboard() {
        List<User> allUsers = userRepository.findAll();
        List<ScanHistory> allScans = scanHistoryRepository.findAllByOrderByScannedAtDesc();

        AdminDashboardResponse resp = new AdminDashboardResponse();

        // ── Summary cards ──────────────────────────────────────
        resp.setTotalUsers(allUsers.size());
        resp.setTotalScans(allScans.size());

        double avg = allScans.stream().mapToInt(ScanHistory::getAtsScore).average().orElse(0.0);
        resp.setAverageScore(Math.round(avg * 10.0) / 10.0);

        resp.setHighScorers(allScans.stream().filter(s -> s.getAtsScore() >= 80).count());

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        resp.setTodaySignups(allUsers.stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(todayStart)).count());
        resp.setTodayScans(allScans.stream().filter(s -> s.getScannedAt() != null && s.getScannedAt().isAfter(todayStart)).count());

        // ── Score distribution ─────────────────────────────────
        Map<String, Long> dist = new LinkedHashMap<>();
        dist.put("0–40",   allScans.stream().filter(s -> s.getAtsScore() < 40).count());
        dist.put("40–60",  allScans.stream().filter(s -> s.getAtsScore() >= 40 && s.getAtsScore() < 60).count());
        dist.put("60–70",  allScans.stream().filter(s -> s.getAtsScore() >= 60 && s.getAtsScore() < 70).count());
        dist.put("70–80",  allScans.stream().filter(s -> s.getAtsScore() >= 70 && s.getAtsScore() < 80).count());
        dist.put("80–90",  allScans.stream().filter(s -> s.getAtsScore() >= 80 && s.getAtsScore() < 90).count());
        dist.put("90–100", allScans.stream().filter(s -> s.getAtsScore() >= 90).count());
        resp.setScoreDistribution(dist);

        // ── Users with aggregated stats ────────────────────────
        Map<UUID, List<ScanHistory>> scansByUser = allScans.stream()
                .collect(Collectors.groupingBy(s -> s.getUser().getId()));

        List<UserSummary> users = allUsers.stream().map(u -> {
            UserSummary us = new UserSummary();
            us.setId(u.getId().toString());
            us.setName(u.getName());
            us.setEmail(u.getEmail());
            us.setCreatedAt(u.getCreatedAt() != null ? u.getCreatedAt().format(FMT) : "—");

            List<ScanHistory> userScans = scansByUser.getOrDefault(u.getId(), List.of());
            us.setScanCount(userScans.size());
            us.setBestScore(userScans.stream().mapToInt(ScanHistory::getAtsScore).max().orElse(0));
            us.setLastActive(userScans.stream()
                    .map(ScanHistory::getScannedAt)
                    .filter(Objects::nonNull)
                    .max(Comparator.naturalOrder())
                    .map(t -> t.format(FMT))
                    .orElse("No scans yet"));
            return us;
        }).sorted(Comparator.comparing(UserSummary::getCreatedAt).reversed())
          .collect(Collectors.toList());

        resp.setUsers(users);

        // ── Recent scans (latest 20) ───────────────────────────
        List<ScanSummary> recentScans = allScans.stream().limit(20).map(s -> {
            ScanSummary ss = new ScanSummary();
            ss.setId(s.getId().toString());
            ss.setUserName(s.getUser().getName());
            ss.setUserEmail(s.getUser().getEmail());
            ss.setResumeFilename(s.getResumeFilename());
            ss.setAtsScore(s.getAtsScore());
            ss.setJobTitle(s.getJobTitle() != null ? s.getJobTitle() : "—");
            ss.setScannedAt(s.getScannedAt() != null ? s.getScannedAt().format(FMT) : "—");
            return ss;
        }).collect(Collectors.toList());

        resp.setRecentScans(recentScans);
        return resp;
    }
}
