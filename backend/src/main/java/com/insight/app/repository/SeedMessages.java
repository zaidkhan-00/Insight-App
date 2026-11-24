package com.insight.app.repository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.insight.app.model.Message;

/**
 * First-run sample messages — the trail that "leads to" each seeded thread.
 */
final class SeedMessages {

    private SeedMessages() {
    }

    static List<Message> seed() {
        Instant now = Instant.now();
        return List.of(
                // t-001 — pricing chat flood
                new Message("m-0011", "t-001", "Maya", "Enterprise account asked if usage-based billing is on the roadmap.", now.minus(125, ChronoUnit.MINUTES)),
                new Message("m-0012", "t-001", "Devon", "Third customer this week. People want pay-per-signal, not seats.", now.minus(96, ChronoUnit.MINUTES)),
                new Message("m-0013", "t-001", "Priya", "Support inbox: two more asking to be flagged when pricing changes ship.", now.minus(64, ChronoUnit.MINUTES)),
                new Message("m-0014", "t-001", "Maya", "This is now the loudest thread in the workspace. Escalating to the launch brief.", now.minus(22, ChronoUnit.MINUTES)),

                // t-002 — onboarding call notes
                new Message("m-0021", "t-002", "Sam", "Call with Northwind went well. Champion is enthusiastic.", now.minus(7, ChronoUnit.HOURS)),
                new Message("m-0022", "t-002", "Sam", "Blocker: they need SSO before their security review will pass.", now.minus(6, ChronoUnit.HOURS)),

                // t-003 — realtime signal refresh
                new Message("m-0031", "t-003", "Ana", "PR up. Replaced the 30s polling loop with a websocket stream.", now.minus(2, ChronoUnit.HOURS)),
                new Message("m-0032", "t-003", "Jonas", "Reconnect logic handles flaky mobile networks now — added 3 integration tests.", now.minus(80, ChronoUnit.MINUTES)),
                new Message("m-0033", "t-003", "Ana", "All green. Ready for review — this removes the last source of stale signals.", now.minus(55, ChronoUnit.MINUTES)),

                // t-004 — digest double-count fix
                new Message("m-0041", "t-004", "Riley", "Bug report: muted threads still inflate the daily digest score.", now.minus(10, ChronoUnit.HOURS)),
                new Message("m-0042", "t-004", "Riley", "Fix merged: the scorer now skips threads flagged muted at scan time.", now.minus(9, ChronoUnit.HOURS)),

                // t-005 — launch brief
                new Message("m-0051", "t-005", "Alex", "v4 drafted. Launch window confirmed with marketing.", now.minus(90, ChronoUnit.MINUTES)),
                new Message("m-0052", "t-005", "Jordan", "Open question remains: do we bundle the signal digest with the team plan?", now.minus(45, ChronoUnit.MINUTES)),
                new Message("m-0053", "t-005", "Alex", "Decision needed by Friday — this is the last unknown before the brief is final.", now.minus(28, ChronoUnit.MINUTES)),

                // t-006 — scoring RFC
                new Message("m-0061", "t-006", "Priya", "RFC started. Should commit bursts decay faster than chat volume?", now.minus(3, ChronoUnit.DAYS)),
                new Message("m-0062", "t-006", "Devon", "Lean yes — commit spikes are one-off; sustained chat means the topic is alive.", now.minus(2, ChronoUnit.DAYS))
        );
    }
}
