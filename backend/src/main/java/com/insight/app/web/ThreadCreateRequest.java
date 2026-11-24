package com.insight.app.web;

/**
 * Body of POST /api/threads. Type-specific counts are optional and only
 * used by the matching subclass.
 */
public record ThreadCreateRequest(
        String type,
        String title,
        String source,
        String summary,
        String urgency,
        Integer messageCount,
        Integer sectionCount,
        Integer filesChanged,
        Integer additions) {
}
