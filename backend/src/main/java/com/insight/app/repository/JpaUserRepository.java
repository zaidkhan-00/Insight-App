package com.insight.app.repository;

import java.util.List;
import java.util.Optional;

import com.insight.app.model.User;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * JPA/PostgreSQL-backed implementation of {@link AuthRepository}.
 */
@Repository
@Transactional
public class JpaUserRepository implements AuthRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        String normalized = email.trim().toLowerCase();
        List<User> result = em.createQuery("select u from User u where u.email = :email", User.class)
                .setParameter("email", normalized)
                .getResultList();
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(String id) {
        return Optional.ofNullable(em.find(User.class, id));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }

    @Override
    public User save(User user) {
        User existing = em.find(User.class, user.getId());
        if (existing == null) {
            em.persist(user);
            return user;
        }
        return em.merge(user);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        Long c = em.createQuery("select count(u) from User u", Long.class).getSingleResult();
        return c == null ? 0L : c;
    }
}