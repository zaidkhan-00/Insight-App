package com.insight.app.service;

import java.time.Instant;

/** The one clear signal distilled from every thread. */
public record SignalDigest(
        String headline,
        String rationale,
        String threadId,
        String threadType,
        double score,
        int scannedThreads,
        Instant computedAt) {
}
