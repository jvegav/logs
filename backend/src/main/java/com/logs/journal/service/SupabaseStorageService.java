package com.logs.journal.service;

import com.logs.journal.exception.StorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    private final String supabaseUrl;
    private final String supabaseKey;
    private final String bucket;
    private final HttpClient httpClient;
    private final Path localFallbackDir;

    public record StorageResult(String url, String storagePath, String fileName, Long fileSize, String contentType) {}

    public SupabaseStorageService(
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.key:}") String supabaseKey,
            @Value("${supabase.bucket:journal-images}") String bucket) {

        this.supabaseUrl = supabaseUrl != null ? supabaseUrl.replaceAll("/+$", "") : "";
        this.supabaseKey = supabaseKey != null ? supabaseKey.trim() : "";
        this.bucket = bucket != null ? bucket.trim() : "journal-images";
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        this.localFallbackDir = Paths.get("uploads").toAbsolutePath().normalize();

        if (isSupabaseConfigured()) {
            log.info("Supabase Storage initialized for bucket '{}' at {}", this.bucket, this.supabaseUrl);
        } else {
            log.warn("Supabase credentials not configured. Using local filesystem fallback at {}", localFallbackDir);
            try {
                Files.createDirectories(this.localFallbackDir);
            } catch (IOException e) {
                log.error("Failed to create local uploads directory", e);
            }
        }
    }

    public boolean isSupabaseConfigured() {
        return StringUtils.hasText(supabaseUrl) &&
               StringUtils.hasText(supabaseKey) &&
               !supabaseUrl.contains("your-project") &&
               !supabaseKey.contains("your-supabase");
    }

    public StorageResult uploadFile(MultipartFile file, Long entryId) {
        if (file.isEmpty()) {
            throw new StorageException("Cannot upload empty file");
        }

        String originalFileName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg"
        );
        String extension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFileName.substring(dotIndex);
        }

        String uniqueFileName = UUID.randomUUID() + extension;
        String storagePath = "entries/" + entryId + "/" + uniqueFileName;
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        long fileSize = file.getSize();

        if (isSupabaseConfigured()) {
            return uploadToSupabase(file, storagePath, originalFileName, fileSize, contentType);
        } else {
            return uploadToLocalFallback(file, storagePath, originalFileName, fileSize, contentType);
        }
    }

    private StorageResult uploadToSupabase(MultipartFile file, String storagePath, String originalFileName, long fileSize, String contentType) {
        try {
            // Supabase Storage REST API endpoint:
            // POST /storage/v1/object/{bucket}/{path}
            String uploadEndpoint = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, storagePath);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uploadEndpoint))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apikey", supabaseKey)
                    .header("Content-Type", contentType)
                    .header("x-upsert", "true")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                String publicUrl = String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucket, storagePath);
                log.info("Uploaded image to Supabase: {}", publicUrl);
                return new StorageResult(publicUrl, storagePath, originalFileName, fileSize, contentType);
            } else {
                log.error("Failed to upload image to Supabase Storage. Status: {}, Body: {}", response.statusCode(), response.body());
                throw new StorageException("Supabase Storage upload failed (status " + response.statusCode() + "): " + response.body());
            }
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new StorageException("Failed to upload file to Supabase Storage: " + e.getMessage(), e);
        }
    }

    private StorageResult uploadToLocalFallback(MultipartFile file, String storagePath, String originalFileName, long fileSize, String contentType) {
        try {
            Path targetFile = localFallbackDir.resolve(storagePath.replace("/", "_"));
            Files.createDirectories(targetFile.getParent());
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            String publicUrl = "/api/uploads/" + targetFile.getFileName().toString();
            log.info("Stored image to local fallback: {}", targetFile);
            return new StorageResult(publicUrl, storagePath, originalFileName, fileSize, contentType);
        } catch (IOException e) {
            throw new StorageException("Failed to store file in local storage: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String storagePath) {
        if (!StringUtils.hasText(storagePath)) {
            return;
        }

        if (isSupabaseConfigured()) {
            deleteFromSupabase(storagePath);
        } else {
            deleteFromLocalFallback(storagePath);
        }
    }

    private void deleteFromSupabase(String storagePath) {
        try {
            // Supabase delete endpoint: DELETE /storage/v1/object/{bucket}/{path}
            // or DELETE /storage/v1/object/{bucket} with prefixes
            String deleteEndpoint = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, storagePath);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(deleteEndpoint))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apikey", supabaseKey)
                    .DELETE()
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Deleted image from Supabase Storage: {}", storagePath);
            } else {
                log.warn("Supabase Storage deletion returned status {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Could not delete file from Supabase Storage: {}", e.getMessage());
        }
    }

    private void deleteFromLocalFallback(String storagePath) {
        try {
            Path targetFile = localFallbackDir.resolve(storagePath.replace("/", "_"));
            Files.deleteIfExists(targetFile);
            log.info("Deleted image from local fallback: {}", targetFile);
        } catch (IOException e) {
            log.warn("Could not delete file from local fallback: {}", e.getMessage());
        }
    }
}
