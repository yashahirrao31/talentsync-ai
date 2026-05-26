package com.atscheck.controller;

import com.atscheck.model.User;
import com.atscheck.model.dto.ResumeAnalysisResponse;
import com.atscheck.service.AuthService;
import com.atscheck.service.ResumeAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeAnalysisService analysisService;
    private final AuthService authService;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/msword",   // .doc
            "application/vnd.oasis.opendocument.text",  // .odt
            "text/plain",
            "application/rtf",
            "text/rtf"
    );

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeAnalysisResponse> analyze(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "jobDescription", required = false) String jobDescription,
            @RequestPart(value = "jobTitle", required = false) String jobTitle,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().build();
        }

        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            return ResponseEntity.badRequest().build();
        }

        User user = authService.getCurrentUser(userDetails.getUsername());
        ResumeAnalysisResponse response = analysisService.analyze(file, jobDescription, jobTitle, user);
        return ResponseEntity.ok(response);
    }
}
