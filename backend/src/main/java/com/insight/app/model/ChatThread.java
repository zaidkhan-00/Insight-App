package com.insight.app.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * A conversation thread (chat / DM / support thread).
 * Busier conversations with high urgency rise to the top of the signal.
 */
@Entity
@DiscriminatorValue("CHAT")
public class ChatThread extends ThreadItem {

    @Column(name = "message_count")
    private int messageCount;

    public ChatThread() {
    }

    public ChatThread(String id, String title, String source, String summary,
                      Urgency urgency, Instant updatedAt, int messageCount) {
        super(id, title, source, summary, urgency, updatedAt);
        this.messageCount = messageCount;
    }

    @Override
    public String getType() {
        return "CHAT";
    }

    @Override
    public double signalWeight() {
        return urgencyBoost() + messageCount * 0.05;
    }

    public int getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(int messageCount) {
        this.messageCount = Math.max(0, messageCount);
    }
}
