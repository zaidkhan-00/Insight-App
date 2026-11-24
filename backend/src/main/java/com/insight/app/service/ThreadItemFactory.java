package com.insight.app.service;

import java.time.Instant;
import java.util.UUID;

import com.insight.app.exception.InvalidThreadException;
import com.insight.app.model.ChatThread;
import com.insight.app.model.CommitThread;
import com.insight.app.model.DocThread;
import com.insight.app.model.ThreadItem;
import com.insight.app.model.Urgency;
import com.insight.app.web.ThreadCreateRequest;

/**
 * Maps validated create-requests onto the right ThreadItem subclass.
 * Unknown types fail fast with an InvalidThreadException.
 */
final class ThreadItemFactory {

    private ThreadItemFactory() {
    }

    static ThreadItem create(ThreadCreateRequest request) {
        Urgency urgency = Urgency.parse(request.urgency());
        String id = "t-" + UUID.randomUUID().toString().substring(0, 8);
        Instant now = Instant.now();

        return switch (requireType(request.type())) {
            case "CHAT" -> new ChatThread(id, request.title(), request.source(),
                    request.summary(), urgency, now, nonNegative(request.messageCount(), "messageCount"));
            case "DOC" -> new DocThread(id, request.title(), request.source(),
                    request.summary(), urgency, now, nonNegative(request.sectionCount(), "sectionCount"));
            case "COMMIT" -> new CommitThread(id, request.title(), request.source(),
                    request.summary(), urgency, now,
                    nonNegative(request.filesChanged(), "filesChanged"),
                    nonNegative(request.additions(), "additions"));
            default -> throw new InvalidThreadException(
                    "Unknown thread type '" + request.type() + "'. Use CHAT, DOC or COMMIT.");
        };
    }

    private static String requireType(String type) {
        if (type == null || type.isBlank()) {
            throw new InvalidThreadException("Thread type is required (CHAT, DOC or COMMIT).");
        }
        return type.trim().toUpperCase();
    }

    private static int nonNegative(Integer value, String field) {
        if (value == null) {
            return 0;
        }
        if (value < 0) {
            throw new InvalidThreadException(field + " must be zero or greater.");
        }
        return value;
    }
}
