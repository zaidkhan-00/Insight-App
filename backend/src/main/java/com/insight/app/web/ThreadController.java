package com.insight.app.web;

import java.util.List;

import com.insight.app.model.ThreadItem;
import com.insight.app.service.Exporter;
import com.insight.app.service.ThreadService;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * CRUD + CSV export for threads.
 */
@RestController
@RequestMapping("/api/threads")
public class ThreadController {

    private final ThreadService threadService;
    private final Exporter exporter;

    public ThreadController(ThreadService threadService, Exporter exporter) {
        this.threadService = threadService;
        this.exporter = exporter;
    }

    /** GET /api/threads            → every thread
     *  GET /api/threads?type=CHAT   → only chats */
    @GetMapping
    public List<ThreadItem> list(@RequestParam(required = false) String type) {
        return type == null ? threadService.all() : threadService.byType(type);
    }

    @GetMapping("/{id}")
    public ThreadItem get(@PathVariable String id) {
        return threadService.get(id);
    }

    @PostMapping
    public ThreadItem create(@RequestBody ThreadCreateRequest request) {
        return threadService.create(request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        threadService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Streams a CSV file that is also written to data/exports/. */
    @GetMapping(value = "/export.csv", produces = "text/csv")
    public ResponseEntity<ByteArrayResource> exportCsv() {
        Path file = exporter.exportThreads(threadService.all());
        try {
            ByteArrayResource body = new ByteArrayResource(Files.readAllBytes(file));
            String filename = file.getFileName().toString();
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .body(body);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not stream exported CSV", e);
        }
    }
}
