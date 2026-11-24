package com.insight.app.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

import com.insight.app.exception.EmptyWorkspaceException;
import com.insight.app.model.ThreadItem;

import org.springframework.stereotype.Service;

/**
 * Default digest engine — picks the thread with the highest polymorphic
 * signalWeight() and explains why it won, in plain language.
 */
@Service
public class SignalDigestService implements DigestEngine {

    @Override
    public SignalDigest computeDigest(List<ThreadItem> threads) {
        if (threads == null || threads.isEmpty()) {
            throw new EmptyWorkspaceException("Nothing to digest — add a thread first.");
        }

        ThreadItem top = threads.stream()
                .max(Comparator.comparingDouble(ThreadItem::signalWeight))
                .orElseThrow(() -> new EmptyWorkspaceException("Nothing to digest — add a thread first."));

        String rationale = switch (top.getType()) {
            case "CHAT" -> "Highest-urgency conversation with the most activity right now.";
            case "DOC" -> "A critical document is moving — decisions are landing in it today.";
            case "COMMIT" -> "A wide, fast-growing change is landing; review it before it ships.";
            default -> "It carries the strongest combined urgency and activity.";
        };

        return new SignalDigest(
                top.getTitle(),
                rationale,
                top.getId(),
                top.getType(),
                Math.round(top.signalWeight() * 100.0) / 100.0,
                threads.size(),
                Instant.now());
    }
}
