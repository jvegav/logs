package com.logs.journal.controller;

import com.logs.journal.dto.CreateEntryRequest;
import com.logs.journal.dto.EntryResponse;
import com.logs.journal.dto.UpdateEntryRequest;
import com.logs.journal.service.EntryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entries")
public class EntryController {

    private final EntryService entryService;

    public EntryController(EntryService entryService) {
        this.entryService = entryService;
    }

    @GetMapping
    public ResponseEntity<List<EntryResponse>> getAllEntries(@RequestParam(value = "search", required = false) String search) {
        List<EntryResponse> entries = entryService.getAllEntries(search);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntryResponse> getEntryById(@PathVariable Long id) {
        EntryResponse entry = entryService.getEntryById(id);
        return ResponseEntity.ok(entry);
    }

    @PostMapping
    public ResponseEntity<EntryResponse> createEntry(@Valid @RequestBody CreateEntryRequest request) {
        EntryResponse created = entryService.createEntry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntryResponse> updateEntry(@PathVariable Long id, @Valid @RequestBody UpdateEntryRequest request) {
        EntryResponse updated = entryService.updateEntry(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        entryService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}
