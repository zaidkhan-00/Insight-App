package com.insight.app.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.insight.app.exception.InvalidThreadException;
import com.insight.app.exception.ThreadNotFoundException;
import com.insight.app.model.ChatThread;
import com.insight.app.model.Message;
import com.insight.app.model.ThreadItem;
import com.insight.app.repository.MessageRepository;
import com.insight.app.repository.SignalRepository;
import com.insight.app.web.MessageCreateRequest;

import org.springframework.stereotype.Service;

/**
 * Messages are the trail that leads to a thread. Adding one keeps the
 * parent thread's activity in sync — chat threads increment their
 * messageCount (a subclass-specific behaviour via pattern matching).
 */
@Service
public class MessageService {

    private final SignalRepository threadRepository;
    private final MessageRepository messageRepository;

    public MessageService(SignalRepository threadRepository, MessageRepository messageRepository) {
        this.threadRepository = threadRepository;
        this.messageRepository = messageRepository;
    }

    public List<Message> byThread(String threadId) {
        requireThread(threadId);
        return messageRepository.findByThread(threadId);
    }

    public Message add(String threadId, MessageCreateRequest request) {
        ThreadItem thread = requireThread(threadId);

        if (request.body() == null || request.body().isBlank()) {
            throw new InvalidThreadException("Message body is required.");
        }
        if (request.body().length() > 1000) {
            throw new InvalidThreadException("Keep messages under 1000 characters.");
        }
        String author = (request.author() == null || request.author().isBlank())
                ? "You" : request.author().trim();

        Message saved = messageRepository.save(new Message(
                "m-" + UUID.randomUUID().toString().substring(0, 8),
                threadId,
                author,
                request.body().trim(),
                Instant.now()));

        // Keep the parent thread in sync (demonstrates `instanceof` pattern matching)
        if (thread instanceof ChatThread chat) {
            chat.setMessageCount(chat.getMessageCount() + 1);
            threadRepository.save(chat);
        } else {
            thread.setUpdatedAt(Instant.now());
            threadRepository.save(thread);
        }
        return saved;
    }

    private ThreadItem requireThread(String threadId) {
        return threadRepository.findById(threadId)
                .orElseThrow(() -> new ThreadNotFoundException(threadId));
    }
}
