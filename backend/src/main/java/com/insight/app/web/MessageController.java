package com.insight.app.web;

import java.util.List;

import com.insight.app.model.Message;
import com.insight.app.service.MessageService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The message trail behind each thread.
 */
@RestController
@RequestMapping("/api/threads/{threadId}/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public List<Message> list(@PathVariable String threadId) {
        return messageService.byThread(threadId);
    }

    @PostMapping
    public Message add(@PathVariable String threadId, @RequestBody MessageCreateRequest request) {
        return messageService.add(threadId, request);
    }
}
