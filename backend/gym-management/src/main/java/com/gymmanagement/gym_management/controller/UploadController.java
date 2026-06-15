package com.gymmanagement.gym_management.controller;

import com.gymmanagement.gym_management.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@Slf4j
public class UploadController {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/jpg", "image/png");
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024; // 5 MB
    private static final String UPLOAD_SUBDIR = "uploads/equipments";

    /**
     * Upload an equipment image.
     * Accepts jpg/jpeg/png, max 5 MB.
     * Stores in <working-dir>/uploads/equipments/ and returns the public URL.
     *
     * Root cause of previous 500:
     *   MultipartFile.transferTo(File) requires an ABSOLUTE path.
     *   Paths.get("uploads/equipments") is relative and its resolution
     *   depends on the JVM working directory — on some deployments the path
     *   didn't exist or wasn't writable, causing an IOException → 500.
     *
     * Fix:
     *   Use toAbsolutePath() to get a fully resolved path, then write the
     *   stream with Files.copy(InputStream, Path) which always works with
     *   any absolute NIO Path.
     */
    @PostMapping(value = "/equipment-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_GYM_OWNER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadEquipmentImage(
            @RequestParam("file") MultipartFile file) throws IOException {

        // ── Validate content type ─────────────────────────────
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Only jpg, jpeg and png images are allowed"));
        }

        // ── Validate size ─────────────────────────────────────
        if (file.getSize() > MAX_SIZE_BYTES) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("File size must not exceed 5 MB"));
        }

        // ── Build unique filename ─────────────────────────────
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase()
                : "jpg";
        String baseName = originalName.contains(".")
                ? originalName.substring(0, originalName.lastIndexOf('.')).toLowerCase()
                : originalName.toLowerCase();
        String sanitized = baseName.replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        if (sanitized.isBlank() || sanitized.equals("-")) sanitized = "image";
        String uniqueName = sanitized + "-" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;

        // ── Resolve ABSOLUTE directory and create if needed ───
        //    toAbsolutePath() anchors the path to the JVM working directory
        //    so Files.createDirectories() and Files.copy() always succeed.
        Path uploadDir = Paths.get(UPLOAD_SUBDIR).toAbsolutePath();
        Files.createDirectories(uploadDir);

        Path targetFile = uploadDir.resolve(uniqueName);

        // ── Write file via InputStream (avoids transferTo absolute-path quirk)
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
        }

        // URL uses the relative /uploads/... path served by WebMvcConfig
        String imageUrl = "/" + UPLOAD_SUBDIR + "/" + uniqueName;

        log.info("[UPLOAD] Image uploaded | file='{}' size={}KB path='{}'",
                uniqueName, file.getSize() / 1024, targetFile);

        return ResponseEntity.ok(ApiResponse.ok("Image uploaded", Map.of("imageUrl", imageUrl)));
    }
}
