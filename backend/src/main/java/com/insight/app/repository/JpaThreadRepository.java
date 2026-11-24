package com.insight.app.repository;

import java.util.List;
import java.util.Optional;

import com.insight.app.model.ThreadItem;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * JPA/PostgreSQL-backed implementation of {@link SignalRepository}.
 */
@Repository
@Transactional
public class JpaThreadRepository implements SignalRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional(readOnly = true)
    public List<ThreadItem> findAll() {
        return em.createQuery("select t from ThreadItem t", ThreadItem.class).getResultList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ThreadItem> findById(String id) {
        return Optional.ofNullable(em.find(ThreadItem.class, id));
    }

    @Override
    public ThreadItem save(ThreadItem item) {
        ThreadItem existing = em.find(ThreadItem.class, item.getId());
        if (existing == null) {
            em.persist(item);
            return item;
        }
        return em.merge(item);
    }

    @Override
    public boolean deleteById(String id) {
        ThreadItem entity = em.find(ThreadItem.class, id);
        if (entity == null) {
            return false;
        }
        em.remove(entity);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public int count() {
        Long c = em.createQuery("select count(t) from ThreadItem t", Long.class).getSingleResult();
        return c == null ? 0 : c.intValue();
    }
}