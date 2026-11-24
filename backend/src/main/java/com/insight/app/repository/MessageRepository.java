package com.insight.app.repository;

import java.util.List;

import com.insight.app.model.Message;

/**
 * Contract for the message store — one more INTERFACE in the stack.
 */
public interface MessageRepository {

    List<Message> findByThread(String threadId);

    Message save(Message message);

    int count();
}
