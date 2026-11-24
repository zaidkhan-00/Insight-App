package com.insight.app.repository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.insight.app.model.ChatThread;
import com.insight.app.model.CommitThread;
import com.insight.app.model.DocThread;
import com.insight.app.model.ThreadItem;
import com.insight.app.model.Urgency;

/**
 * First-run sample data so the dashboard is never empty.
 */
final class SeedData {

    private SeedData() {
    }

    static List<ThreadItem> seed() {
        Instant now = Instant.now();
        return List.of(
                new ChatThread("t-001", "Pricing page feedback flood",
                        "#customer-feedback", "19 replies about the new tiers; two enterprise customers want usage-based billing.",
                        Urgency.HIGH, now.minus(2, ChronoUnit.HOURS), 19),
                new ChatThread("t-002", "Onboarding call notes — Northwind",
                        "meetings", "They want SSO before rollout; champion is enthusiastic.",
                        Urgency.MEDIUM, now.minus(6, ChronoUnit.HOURS), 7),
                new CommitThread("t-003", "feat: realtime signal refresh",
                        "github.com/insight/core", "Replaced polling with a websocket stream for the dashboard.",
                        Urgency.HIGH, now.minus(1, ChronoUnit.HOURS), 14, 412),
                new CommitThread("t-004", "fix: digest double-counts muted threads",
                        "github.com/insight/core", "Muted threads no longer inflate the signal score.",
                        Urgency.MEDIUM, now.minus(9, ChronoUnit.HOURS), 3, 46),
                new DocThread("t-005", "Q3 launch brief v4",
                        "notion", "Launch window confirmed; remaining unknowns are pricing and packaging.",
                        Urgency.CRITICAL, now.minus(30, ChronoUnit.MINUTES), 12),
                new DocThread("t-006", "Signal scoring RFC",
                        "notion", "Open question: should commit bursts decay faster than chat volume?",
                        Urgency.LOW, now.minus(3, ChronoUnit.DAYS), 6)
        );
    }
}
