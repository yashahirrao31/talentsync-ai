package com.atscheck.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeParserService {

    private final Tika tika = new Tika();

    /**
     * Extracts plain text from any supported resume format:
     * PDF, DOCX, DOC, ODT, TXT, RTF
     */
    public String extractText(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            AutoDetectParser parser = new AutoDetectParser();
            BodyContentHandler handler = new BodyContentHandler(10 * 1024 * 1024); // 10MB char limit
            Metadata metadata = new Metadata();
            metadata.set(Metadata.CONTENT_TYPE, file.getContentType());
            ParseContext context = new ParseContext();

            parser.parse(inputStream, handler, metadata, context);
            String extracted = handler.toString().trim();

            if (extracted.isBlank()) {
                throw new RuntimeException("Could not extract text from the uploaded file. Please ensure the file is not image-only.");
            }

            log.info("Extracted {} characters from file: {}", extracted.length(), file.getOriginalFilename());
            return extracted;

        } catch (Exception e) {
            log.error("Failed to parse resume file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to parse resume: " + e.getMessage(), e);
        }
    }

    public String detectMimeType(MultipartFile file) {
        try {
            return tika.detect(file.getInputStream(), file.getOriginalFilename());
        } catch (Exception e) {
            return file.getContentType();
        }
    }
}
