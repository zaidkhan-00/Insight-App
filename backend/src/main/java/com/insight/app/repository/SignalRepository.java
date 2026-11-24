package com.insight.app.repository;

import java.util.List;
import java.util.Optional;

import com.insight.app.model.ThreadItem;

/**
 * Abstraction over the thread store.
 *
 * Demonstrates an INTERFACE: the controller/service layers depend on this
 * contract, not on the JSON-file implementation, so the storage mechanism
 * could be swapped (database, in-memory, remote) without touching callers.
 */
public interface SignalRepository {

    List<ThreadItem> findAll();

    Optional<ThreadItem> findById(String id);

    ThreadItem save(ThreadItem item);

    boolean deleteById(String id);

    int count();
}
