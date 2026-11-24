package com.insight.app.web;

import java.time.Instant;

import com.insight.app.model.User;

/**
 * The safe, public view of a user — no password hash or salt ever leaves
 * the backend.
 */
public record PublicUser(String id, String email, String name, Instant createdAt) {

    public static PublicUser from(User user) {
        return new PublicUser(user.getId(), user.getEmail(), user.getName(), user.getCreatedAt());
    }
}
