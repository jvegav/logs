package com.logs.journal.dto;

import com.logs.journal.entity.Entry;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class EntryResponse {

    private Long id;
    private String title;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ImageResponse> images;

    public EntryResponse() {
    }

    public EntryResponse(Long id, String title, String content, Instant createdAt, Instant updatedAt, List<ImageResponse> images) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.images = images;
    }

    public static EntryResponse fromEntity(Entry entry) {
        if (entry == null) return null;

        List<ImageResponse> imageResponses = entry.getImages() != null
                ? entry.getImages().stream().map(ImageResponse::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        return new EntryResponse(
                entry.getId(),
                entry.getTitle(),
                entry.getContent(),
                entry.getCreatedAt(),
                entry.getUpdatedAt(),
                imageResponses
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ImageResponse> getImages() {
        return images;
    }

    public void setImages(List<ImageResponse> images) {
        this.images = images;
    }
}
