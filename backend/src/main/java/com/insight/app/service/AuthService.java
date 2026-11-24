package com.insight.app.service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.insight.app.exception.DuplicateEmailException;
import com.insight.app.exception.InvalidAuthException;
import com.insight.app.exception.InvalidCredentialsException;
import com.insight.app.model.User;
import com.insight.app.repository.AuthRepository;
import com.insight.app.web.AuthRequest;
import com.insight.app.web.PublicUser;
import com.insight.app.web.SessionResponse;

import org.springframework.stereotype.Service;

/**
 * Registration, login and opaque-token sessions.
 *
 * - Passwords hashed with PBKDF2 (per-user salt, constant-time compare).
 * - Sessions kept in a ConcurrentHashMap: token -> userId — thread-safe
 *   across the request pool without extra locking.
 * - Tokens are random UUIDs; they expire when the backend restarts.
 */
@Service
public class AuthService {

    private final AuthRepository users;
    private final Map<String, String> sessions = new ConcurrentHashMap<>(); // token -> userId

    public AuthService(AuthRepository users) {
        this.users = users;
    }

    public SessionResponse register(AuthRequest request) {
        String email = requireEmail(request.email());
        String name = requireName(request.name());
        String password = requirePassword(request.password());

        if (users.existsByEmail(email)) {
            throw new DuplicateEmailException(email);
        }

        String salt = PasswordHasher.newSalt();
        User user = new User(
                "u-" + UUID.randomUUID().toString().substring(0, 8),
                email,
                name,
                PasswordHasher.hash(password, salt),
                salt,
                Instant.now());
        users.save(user);
        return issue(user);
    }

    public SessionResponse login(AuthRequest request) {
        String email = requireEmail(request.email());
        String password = requirePassword(request.password());

        User user = users.findByEmail(email).orElseThrow(InvalidCredentialsException::new);
        if (!PasswordHasher.matches(password, user.getSalt(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return issue(user);
    }

    /** Resolves a session token to its user, or empty when unknown/expired. */
    public Optional<User> resolve(String token) {
        if (token == null) {
            return Optional.empty();
        }
        String userId = sessions.get(token);
        if (userId == null) {
            return Optional.empty();
        }
        return users.findById(userId);
    }

    public void logout(String token) {
        if (token != null) {
            sessions.remove(token);
        }
    }

    private SessionResponse issue(User user) {
        String token = UUID.randomUUID().toString();
        sessions.put(token, user.getId());
        return new SessionResponse(token, PublicUser.from(user));
    }

    private String requireEmail(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new InvalidAuthException("Email is required.");
        }
        String email = raw.trim().toLowerCase();
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new InvalidAuthException("Enter a valid email address.");
        }
        return email;
    }

    private String requireName(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new InvalidAuthException("Your name is required.");
        }
        return raw.trim();
    }

    private String requirePassword(String raw) {
        if (raw == null || raw.length() < 8) {
            throw new InvalidAuthException("Password must be at least 8 characters.");
        }
        return raw;
    }
}
