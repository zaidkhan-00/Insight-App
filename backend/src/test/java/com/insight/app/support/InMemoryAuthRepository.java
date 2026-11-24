package com.insight.app.support;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import com.insight.app.model.User;
import com.insight.app.repository.AuthRepository;

/**
 * In-memory {@link AuthRepository} for tests.
 *
 * Mirrors the e-mail normalisation of {@link com.insight.app.repository.JpaUserRepository}
 * (trim + lower-case) so service/controller tests run without PostgreSQL.
 */
public class InMemoryAuthRepository implements AuthRepository {

    private final Map<String, User> byId = new ConcurrentHashMap<>();

    @Override
    public Optional<User> findByEmail(String email) {
        if (email == null) {
            return Optional.empty();
        }
        String normalized = email.trim().toLowerCase();
        return byId.values().stream()
                .filter(user -> normalized.equals(user.getEmail()))
                .findFirst();
    }

    @Override
    public Optional<User> findById(String id) {
        return id == null ? Optional.empty() : Optional.ofNullable(byId.get(id));
    }

    @Override
    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }

    @Override
    public User save(User user) {
        byId.put(user.getId(), user);
        return user;
    }

    @Override
    public long count() {
        return byId.size();
    }

    /** Test helper: drop all users between tests. */
    public void clear() {
        byId.clear();
    }
}
