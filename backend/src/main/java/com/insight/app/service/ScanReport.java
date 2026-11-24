package com.insight.app.service;

import java.time.Instant;

/** Result of one parallel scan sweep across the whole workspace. */
public record ScanReport(
        int requested,
        int succeeded,
        int failed,
        long durationMs,
        int workerThreads,
        Instant scannedAt) {
}
