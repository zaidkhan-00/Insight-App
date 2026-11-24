package com.insight.app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.insight.app.exception.DuplicateEmailException;
import com.insight.app.exception.InvalidAuthException;
import com.insight.app.exception.InvalidCredentialsException;
import com.insight.app.model.User;
import com.insight.app.support.InMemoryAuthRepository;
import com.insight.app.web.AuthRequest;
import com.insight.app.web.SessionResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * Unit tests for login/registration/session rules (no Spring context, no database).
 * Maps to the AUTH-REG-*, AUTH-LGN-* and AUTH-SES-* cases in
 * docs/06-login-test-cases.md.
 */
class AuthServiceTest {

    private static final String EMAIL = "demo@insight.app";
    private static final String NAME = "Demo User";
    private static final String PASSWORD = "insight123";

    private InMemoryAuthRepository users;
    private AuthService auth;

    @BeforeEach
    void setUp() {
        users = new InMemoryAuthRepository();
        auth = new AuthService(users);
    }

    private SessionResponse register(String email, String name, String password) {
        return auth.register(new AuthRequest(email, name, password));
    }

    private SessionResponse login(String email, String password) {
        return auth.login(new AuthRequest(email, null, password));
    }

    // ---------------------------------------------------------------- register

    @Test
    void registerReturnsATokenAndPublicUser() {
        SessionResponse session = register(EMAIL, NAME, PASSWORD);

        assertNotNull(session.token());
        assertFalse(session.token().isBlank());
        assertNotNull(session.user().id());
        assertEquals(EMAIL, session.user().email());
        assertEquals(NAME, session.user().name());
        assertNotNull(session.user().createdAt());
    }

    @Test
    void registerStoresAHashNotThePlainPassword() {
        register(EMAIL, NAME, PASSWORD);

        User stored = users.findByEmail(EMAIL).orElseThrow();
        assertNotEquals(PASSWORD, stored.getPasswordHash());
        assertTrue(PasswordHasher.matches(PASSWORD, stored.getSalt(), stored.getPasswordHash()));
    }

    @Test
    void registerNormalisesEmailToLowerCaseAndTrims() {
        SessionResponse session = register("  Demo@Insight.APP  ", NAME, PASSWORD);

        assertEquals(EMAIL, session.user().email());
        assertTrue(users.findByEmail("DEMO@insight.app").isPresent());
    }

    @Test
    void registerTrimsName() {
        SessionResponse session = register(EMAIL, "  Demo User  ", PASSWORD);

        assertEquals(NAME, session.user().name());
    }

    @Test
    void registerRejectsDuplicateEmailRegardlessOfCase() {
        register(EMAIL, NAME, PASSWORD);

        DuplicateEmailException error =
                assertThrows(DuplicateEmailException.class, () -> register("DEMO@Insight.App", NAME, PASSWORD));

        assertEquals("An account with email 'demo@insight.app' already exists.", error.getMessage());
        assertEquals(1, users.count());
    }

    @Test
    void registerRejectsMissingEmail() {
        InvalidAuthException error = assertThrows(InvalidAuthException.class, () -> register("   ", NAME, PASSWORD));

        assertEquals("Email is required.", error.getMessage());
    }

    @ParameterizedTest
    @ValueSource(strings = {"demo", "demo@", "@insight.app", "demo@insight", "de mo@insight.app"})
    void registerRejectsMalformedEmail(String email) {
        InvalidAuthException error = assertThrows(InvalidAuthException.class, () -> register(email, NAME, PASSWORD));

        assertEquals("Enter a valid email address.", error.getMessage());
    }

    @Test
    void registerRejectsMissingName() {
        InvalidAuthException error = assertThrows(InvalidAuthException.class, () -> register(EMAIL, "  ", PASSWORD));

        assertEquals("Your name is required.", error.getMessage());
    }

    @Test
    void registerRejectsPasswordShorterThanEightCharacters() {
        InvalidAuthException error = assertThrows(InvalidAuthException.class, () -> register(EMAIL, NAME, "1234567"));

        assertEquals("Password must be at least 8 characters.", error.getMessage());
        assertEquals(0, users.count());
    }

    @Test
    void registerAcceptsExactlyEightCharacterPassword() {
        SessionResponse session = register(EMAIL, NAME, "12345678");

        assertNotNull(session.token());
    }

    @Test
    void registerAssignsUniqueIdsAndTokens() {
        SessionResponse first = register("a@insight.app", "A", PASSWORD);
        SessionResponse second = register("b@insight.app", "B", PASSWORD);

        assertNotEquals(first.user().id(), second.user().id());
        assertNotEquals(first.token(), second.token());
    }

    // ------------------------------------------------------------------- login

    @Test
    void loginSucceedsWithTheCorrectPassword() {
        register(EMAIL, NAME, PASSWORD);

        SessionResponse session = login(EMAIL, PASSWORD);

        assertNotNull(session.token());
        assertEquals(EMAIL, session.user().email());
        assertEquals(NAME, session.user().name());
    }

    @Test
    void loginIsCaseInsensitiveAndTrimsTheEmail() {
        register(EMAIL, NAME, PASSWORD);

        SessionResponse session = login("  DEMO@INSIGHT.APP  ", PASSWORD);

        assertEquals(EMAIL, session.user().email());
    }

    @Test
    void loginRejectsWrongPassword() {
        register(EMAIL, NAME, PASSWORD);

        InvalidCredentialsException error =
                assertThrows(InvalidCredentialsException.class, () -> login(EMAIL, "wrong-password"));

        assertEquals("Email or password is incorrect.", error.getMessage());
    }

    @Test
    void loginRejectsUnknownEmailWithTheSameMessage() {
        register(EMAIL, NAME, PASSWORD);

        InvalidCredentialsException error =
                assertThrows(InvalidCredentialsException.class, () -> login("nobody@insight.app", PASSWORD));

        assertEquals("Email or password is incorrect.", error.getMessage());
    }

    @Test
    void loginRejectsMissingEmail() {
        InvalidAuthException error = assertThrows(InvalidAuthException.class, () -> login(" ", PASSWORD));

        assertEquals("Email is required.", error.getMessage());
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "  ", "short"})
    void loginRejectsPasswordShorterThanEightCharacters(String password) {
        register(EMAIL, NAME, PASSWORD);

        InvalidAuthException error = assertThrows(InvalidAuthException.class, () -> login(EMAIL, password));

        assertEquals("Password must be at least 8 characters.", error.getMessage());
    }

    @Test
    void loginPasswordIsCaseAndWhitespaceSensitive() {
        register(EMAIL, NAME, PASSWORD);

        assertThrows(InvalidCredentialsException.class, () -> login(EMAIL, "Insight123"));
        assertThrows(InvalidCredentialsException.class, () -> login(EMAIL, " insight123"));
        assertThrows(InvalidCredentialsException.class, () -> login(EMAIL, "insight123 "));
    }

    @Test
    void registerAcceptsAPasswordOfEightSpaces() {
        // Current behaviour: passwords are not trimmed, only length-checked.
        SessionResponse session = register(EMAIL, NAME, "        ");

        assertNotNull(session.token());
        assertNotNull(login(EMAIL, "        ").token());
    }

    @Test
    void loginIssuesANewTokenEveryTime() {
        register(EMAIL, NAME, PASSWORD);

        String first = login(EMAIL, PASSWORD).token();
        String second = login(EMAIL, PASSWORD).token();

        assertNotEquals(first, second);
        assertTrue(auth.resolve(first).isPresent());
        assertTrue(auth.resolve(second).isPresent());
    }

    @Test
    void loginDoesNotRequireAName() {
        register(EMAIL, NAME, PASSWORD);

        SessionResponse session = auth.login(new AuthRequest(EMAIL, null, PASSWORD));

        assertNotNull(session.token());
    }

    // ---------------------------------------------------------------- sessions

    @Test
    void resolveReturnsTheUserForAGoodToken() {
        String token = register(EMAIL, NAME, PASSWORD).token();

        User user = auth.resolve(token).orElseThrow();
        assertEquals(EMAIL, user.getEmail());
    }

    @Test
    void resolveReturnsEmptyForAnUnknownToken() {
        assertTrue(auth.resolve("not-a-real-token").isEmpty());
    }

    @Test
    void resolveReturnsEmptyForANullToken() {
        assertTrue(auth.resolve(null).isEmpty());
    }

    @Test
    void logoutInvalidatesTheToken() {
        String token = register(EMAIL, NAME, PASSWORD).token();
        assertTrue(auth.resolve(token).isPresent());

        auth.logout(token);

        assertTrue(auth.resolve(token).isEmpty());
    }

    @Test
    void logoutOfAnUnknownOrNullTokenIsANoOp() {
        String token = register(EMAIL, NAME, PASSWORD).token();

        auth.logout("not-a-real-token");
        auth.logout(null);

        assertTrue(auth.resolve(token).isPresent());
    }

    @Test
    void loggingOutOneSessionLeavesOtherSessionsAlive() {
        register(EMAIL, NAME, PASSWORD);
        String first = login(EMAIL, PASSWORD).token();
        String second = login(EMAIL, PASSWORD).token();

        auth.logout(first);

        assertTrue(auth.resolve(first).isEmpty());
        assertTrue(auth.resolve(second).isPresent());
    }
}
