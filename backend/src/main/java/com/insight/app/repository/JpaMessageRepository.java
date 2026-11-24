package com.insight.app.repository;

import java.util.List;

import com.insight.app.model.Message;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * JPA/PostgreSQL-backed implementation of {@link MessageRepository}.
 */
@Repository
@Transactional
public class JpaMessageRepository implements MessageRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional(readOnly = true)
    public List<Message> findByThread(String threadId) {
        return em.createQuery("select m from Message m where m.threadId = :tid order by m.createdAt asc", Message.class)
                .setParameter("tid", threadId)
                .getResultList();
    }

    @Override
    public Message save(Message message) {
        Message existing = em.find(Message.class, message.getId());
        if (existing == null) {
            em.persist(message);
            return message;
        }
        return em.merge(message);
    }

    @Override
    @Transactional(readOnly = true)
    public int count() {
        Long c = em.createQuery("select count(m) from Message m", Long.class).getSingleResult();
        return c == null ? 0 : c.intValue();
    }
}