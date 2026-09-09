package com.logs.journal.controller;

import com.logs.journal.dto.ImageResponse;
import com.logs.journal.service.EntryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/entries/{id}/images")
public class EntryImageController {

    private final EntryService entryService;

    public EntryImageController(EntryService entryService) {
        this.entryService = entryService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ImageResponse>> uploadImages(
            @PathVariable("id") Long id,
            @RequestParam("files") List<MultipartFile> files) {

        List<ImageResponse> uploadedImages = entryService.addImagesToEntry(id, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadedImages);
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable("id") Long id,
            @PathVariable("imageId") Long imageId) {

        entryService.deleteImageFromEntry(id, imageId);
        return ResponseEntity.noContent().build();
    }
}
