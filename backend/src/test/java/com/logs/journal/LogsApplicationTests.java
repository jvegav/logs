package com.logs.journal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.logs.journal.dto.CreateEntryRequest;
import com.logs.journal.dto.UpdateEntryRequest;
import com.logs.journal.entity.Entry;
import com.logs.journal.repository.EntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
class LogsApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntryRepository entryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        entryRepository.deleteAll();
    }

    @Test
    void shouldCreateAndRetrieveJournalEntry() throws Exception {
        CreateEntryRequest request = new CreateEntryRequest("First Reflection", "Today was quiet and peaceful.");

        String responseJson = mockMvc.perform(post("/api/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title", is("First Reflection")))
                .andExpect(jsonPath("$.content", is("Today was quiet and peaceful.")))
                .andExpect(jsonPath("$.images", hasSize(0)))
                .andReturn().getResponse().getContentAsString();

        Entry createdEntry = objectMapper.readValue(responseJson, Entry.class);

        mockMvc.perform(get("/api/entries/" + createdEntry.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("First Reflection")));

        mockMvc.perform(get("/api/entries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("First Reflection")));
    }

    @Test
    void shouldUpdateJournalEntry() throws Exception {
        Entry entry = entryRepository.save(new Entry("Initial Title", "Initial content"));

        UpdateEntryRequest updateRequest = new UpdateEntryRequest("Updated Title", "Updated content");

        mockMvc.perform(put("/api/entries/" + entry.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Title")))
                .andExpect(jsonPath("$.content", is("Updated content")));
    }

    @Test
    void shouldDeleteJournalEntry() throws Exception {
        Entry entry = entryRepository.save(new Entry("To be deleted", "Bye"));

        mockMvc.perform(delete("/api/entries/" + entry.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/entries/" + entry.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldAttachImagesToEntry() throws Exception {
        Entry entry = entryRepository.save(new Entry("Entry with photos", "Capturing moments"));

        MockMultipartFile file = new MockMultipartFile(
                "files",
                "test-photo.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image content".getBytes()
        );

        mockMvc.perform(multipart("/api/entries/" + entry.getId() + "/images")
                        .file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].fileName", is("test-photo.jpg")));

        mockMvc.perform(get("/api/entries/" + entry.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images", hasSize(1)))
                .andExpect(jsonPath("$.images[0].fileName", is("test-photo.jpg")));
    }
}
