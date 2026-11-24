package com.insight.app.web;

/** Body of POST /api/threads/{id}/messages. */
public record MessageCreateRequest(String author, String body) {
}
