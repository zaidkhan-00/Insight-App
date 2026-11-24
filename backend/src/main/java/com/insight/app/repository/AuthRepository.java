package com.insight.app.repository;

import java.util.Optional;

import com.insight.app.model.User;

/**
 * Contract for the user store — another INTERFACE in the stack.
 */
public interface AuthRepository {

    Optional<User> findByEmail(String email);

    Optional<User> findById(String id);

    boolean existsByEmail(String email);

    User save(User user);

    long count();
}
