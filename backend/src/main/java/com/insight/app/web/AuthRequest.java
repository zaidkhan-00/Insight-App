package com.insight.app.web;

/**
 * Body of POST /api/auth/login and /api/auth/register.
 * `name` is only required for registration.
 */
public record AuthRequest(String email, String name, String password) {
}
