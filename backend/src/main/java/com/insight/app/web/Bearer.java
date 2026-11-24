package com.insight.app.web;

/**
 * Extracts the bearer token from an Authorization header.
 */
final class Bearer {

    private Bearer() {
    }

    static String extract(String header) {
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring("Bearer ".length()).trim();
        return token.isEmpty() ? null : token;
    }
}
