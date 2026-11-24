package com.insight.app.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

/**
 * Unit tests for the Authorization-header parser used by the controller and interceptor.
 */
class BearerTest {

    @Test
    void extractsTheToken() {
        assertEquals("abc-123", Bearer.extract("Bearer abc-123"));
    }

    @Test
    void trimsSurroundingWhitespaceInsideTheHeader() {
        assertEquals("abc-123", Bearer.extract("Bearer   abc-123   "));
    }

    @Test
    void rejectsMissingOrForeignSchemes() {
        assertNull(Bearer.extract(null));
        assertNull(Bearer.extract(""));
        assertNull(Bearer.extract("abc-123"));
        assertNull(Bearer.extract("bearer abc-123"));
        assertNull(Bearer.extract("Token abc-123"));
    }

    @Test
    void rejectsAnEmptyBearerValue() {
        assertNull(Bearer.extract("Bearer "));
        assertNull(Bearer.extract("Bearer    "));
    }
}
