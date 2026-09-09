package com.logs.journal.dto;

import com.logs.journal.entity.EntryImage;
import java.time.Instant;

public class ImageResponse {

    private Long id;
    private String url;
    private String fileName;
    private Long fileSize;
    private String contentType;
    private Instant createdAt;

    public ImageResponse() {
    }

    public ImageResponse(Long id, String url, String fileName, Long fileSize, String contentType, Instant createdAt) {
        this.id = id;
        this.url = url;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.createdAt = createdAt;
    }

    public static ImageResponse fromEntity(EntryImage image) {
        if (image == null) return null;
        return new ImageResponse(
                image.getId(),
                image.getUrl(),
                image.getFileName(),
                image.getFileSize(),
                image.getContentType(),
                image.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
