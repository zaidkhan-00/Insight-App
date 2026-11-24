package com.insight.app.service;

import java.util.List;

import com.insight.app.exception.InvalidThreadException;
import com.insight.app.exception.ThreadNotFoundException;
import com.insight.app.model.ThreadItem;
import com.insight.app.repository.SignalRepository;
import com.insight.app.web.ThreadCreateRequest;

import org.springframework.stereotype.Service;

/**
 * Business rules for the thread workspace. Controllers stay thin;
 * validation errors surface as InvalidThreadException (→ HTTP 400).
 */
@Service
public class ThreadService {

    private final SignalRepository repository;

    public ThreadService(SignalRepository repository) {
        this.repository = repository;
    }

    public List<ThreadItem> all() {
        return repository.findAll();
    }

    public List<ThreadItem> byType(String type) {
        String normalized = normalizeType(type);
        return repository.findAll().stream()
                .filter(thread -> thread.getType().equals(normalized))
                .toList();
    }

    public ThreadItem get(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ThreadNotFoundException(id));
    }

    public ThreadItem create(ThreadCreateRequest request) {
        validate(request);
        ThreadItem item = ThreadItemFactory.create(request);
        // Guard against the (astronomically unlikely) id clash
        while (repository.findById(item.getId()).isPresent()) {
            item = ThreadItemFactory.create(request);
        }
        return repository.save(item);
    }

    public void delete(String id) {
        if (!repository.deleteById(id)) {
            throw new ThreadNotFoundException(id);
        }
    }

    private void validate(ThreadCreateRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new InvalidThreadException("A title is required.");
        }
        if (request.title().length() > 120) {
            throw new InvalidThreadException("Keep the title under 120 characters.");
        }
        if (request.source() == null || request.source().isBlank()) {
            throw new InvalidThreadException("A source (channel, repo, tool) is required.");
        }
    }

    private String normalizeType(String type) {
        if (type == null || type.isBlank()) {
            throw new InvalidThreadException("Type filter is required (CHAT, DOC or COMMIT).");
        }
        String normalized = type.trim().toUpperCase();
        if (!normalized.equals("CHAT") && !normalized.equals("DOC") && !normalized.equals("COMMIT")) {
            throw new InvalidThreadException("Unknown type filter '" + type + "'.");
        }
        return normalized;
    }
}
