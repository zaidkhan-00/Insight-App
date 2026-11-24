package com.insight.app.model;

import com.insight.app.exception.InvalidThreadException;

/**
 * Urgency of a thread — drives the polymorphic signal-weight scoring.
 */
public enum Urgency {
    LOW, MEDIUM, HIGH, CRITICAL;

    /** Case-insensitive parse used when creating threads from user input. */
    public static Urgency parse(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new InvalidThreadException("Urgency is required (LOW, MEDIUM, HIGH, CRITICAL).");
        }
        try {
            return valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidThreadException("Unknown urgency '" + raw + "'. Use LOW, MEDIUM, HIGH or CRITICAL.");
        }
    }
}
