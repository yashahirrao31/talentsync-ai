package com.atscheck.controller;

import com.atscheck.model.dto.AdminDashboardResponse;
import com.atscheck.repository.UserRepository;
import com.atscheck.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin-only endpoints. Protected by JWT + email whitelist.
 * Uses Authentication from SecurityContext (avoids NPE from @AuthenticationPrincipal).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    @Value("${admin.email:#{null}}")
    private String adminEmail;

    /** GET /api/admin/dashboard — returns full stats for the admin UI */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        // Get the currently authenticated user's email safely
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required."));
        }

        String currentEmail = ((UserDetails) auth.getPrincipal()).getUsername();

        if (!isAdmin(currentEmail)) {
            log.warn("Unauthorized admin access attempt by: {}", currentEmail);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied. Admin privileges required."));
        }

        AdminDashboardResponse dashboard = adminService.getDashboard();
        log.info("Admin dashboard loaded by: {}", currentEmail);
        return ResponseEntity.ok(dashboard);
    }

    private boolean isAdmin(String email) {
        if (email == null || email.isBlank()) return false;
        // If ADMIN_EMAIL is not set, any authenticated user can access (dev mode)
        if (adminEmail == null || adminEmail.isBlank()) {
            return true;
        }
        return adminEmail.equalsIgnoreCase(email);
    }
}
