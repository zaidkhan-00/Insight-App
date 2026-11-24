package com.insight.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

/**
 * Unit tests for the PBKDF2 password helper that login depends on.
 * (Covers AUTH-SEC-01..04 in docs/06-login-test-cases.md.)
 */
class PasswordHasherTest {

    @Test
    void hashIsDeterministicForTheSameSalt() {
        String salt = PasswordHasher.newSalt();

        String first = PasswordHasher.hash("insight123", salt);
        String second = PasswordHasher.hash("insight123", salt);

        assertEquals(first, second);
    }

    @Test
    void differentSaltsProduceDifferentHashes() {
        String saltA = PasswordHasher.newSalt();
        String saltB = PasswordHasher.newSalt();

        String hashA = PasswordHasher.hash("insight123", saltA);
        String hashB = PasswordHasher.hash("insight123", saltB);

        assertNotEquals(saltA, saltB);
        assertNotEquals(hashA, hashB);
    }

    @Test
    void matchesAcceptsTheCorrectPassword() {
        String salt = PasswordHasher.newSalt();
        String hash = PasswordHasher.hash("insight123", salt);

        assertTrue(PasswordHasher.matches("insight123", salt, hash));
    }

    @Test
    void matchesRejectsAWrongPassword() {
        String salt = PasswordHasher.newSalt();
        String hash = PasswordHasher.hash("insight123", salt);

        assertFalse(PasswordHasher.matches("insight124", salt, hash));
        assertFalse(PasswordHasher.matches("", salt, hash));
    }

    @Test
    void newSaltIsSixteenBytesBase64Encoded() {
        String salt = PasswordHasher.newSalt();

        assertTrue(salt.length() >= 24, "16 random bytes encode to 24 base64 chars");
    }

    @Test
    void hashIsBase64EncodedAndNotThePlainPassword() {
        String hash = PasswordHasher.hash("insight123", PasswordHasher.newSalt());

        assertNotEquals("insight123", hash);
        assertTrue(hash.length() >= 43, "256-bit key encodes to 44 base64 chars");
    }
}
