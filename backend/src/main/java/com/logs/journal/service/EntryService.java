package com.logs.journal.service;

import com.logs.journal.dto.CreateEntryRequest;
import com.logs.journal.dto.EntryResponse;
import com.logs.journal.dto.ImageResponse;
import com.logs.journal.dto.UpdateEntryRequest;
import com.logs.journal.entity.Entry;
import com.logs.journal.entity.EntryImage;
import com.logs.journal.exception.ResourceNotFoundException;
import com.logs.journal.repository.EntryImageRepository;
import com.logs.journal.repository.EntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EntryService {

    private final EntryRepository entryRepository;
    private final EntryImageRepository entryImageRepository;
    private final SupabaseStorageService storageService;

    public EntryService(EntryRepository entryRepository,
                        EntryImageRepository entryImageRepository,
                        SupabaseStorageService storageService) {
        this.entryRepository = entryRepository;
        this.entryImageRepository = entryImageRepository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<EntryResponse> getAllEntries(String search) {
        List<Entry> entries;
        if (StringUtils.hasText(search)) {
            entries = entryRepository.searchByQuery(search.trim());
        } else {
            entries = entryRepository.findAllByOrderByCreatedAtDesc();
        }
        return entries.stream()
                .map(EntryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EntryResponse getEntryById(Long id) {
        Entry entry = findEntryOrThrow(id);
        return EntryResponse.fromEntity(entry);
    }

    @Transactional
    public EntryResponse createEntry(CreateEntryRequest request) {
        Entry entry = new Entry(request.getTitle(), request.getContent());
        Entry saved = entryRepository.save(entry);
        return EntryResponse.fromEntity(saved);
    }

    @Transactional
    public EntryResponse updateEntry(Long id, UpdateEntryRequest request) {
        Entry entry = findEntryOrThrow(id);
        entry.setTitle(request.getTitle());
        entry.setContent(request.getContent());
        Entry updated = entryRepository.save(entry);
        return EntryResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteEntry(Long id) {
        Entry entry = findEntryOrThrow(id);

        // Delete all images associated with this entry from storage
        for (EntryImage image : entry.getImages()) {
            storageService.deleteFile(image.getStoragePath());
        }

        entryRepository.delete(entry);
    }

    @Transactional
    public List<ImageResponse> addImagesToEntry(Long entryId, List<MultipartFile> files) {
        Entry entry = findEntryOrThrow(entryId);
        List<ImageResponse> savedImages = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return savedImages;
        }

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            SupabaseStorageService.StorageResult uploadResult = storageService.uploadFile(file, entryId);
            EntryImage image = new EntryImage(
                    uploadResult.url(),
                    uploadResult.storagePath(),
                    uploadResult.fileName(),
                    uploadResult.fileSize(),
                    uploadResult.contentType()
            );
            entry.addImage(image);
            EntryImage savedImage = entryImageRepository.save(image);
            savedImages.add(ImageResponse.fromEntity(savedImage));
        }

        return savedImages;
    }

    @Transactional
    public void deleteImageFromEntry(Long entryId, Long imageId) {
        // Verify entry exists
        findEntryOrThrow(entryId);

        EntryImage image = entryImageRepository.findByIdAndEntryId(imageId, entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id " + imageId + " for entry " + entryId));

        storageService.deleteFile(image.getStoragePath());
        entryImageRepository.delete(image);
    }

    private Entry findEntryOrThrow(Long id) {
        return entryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found with id: " + id));
    }
}
