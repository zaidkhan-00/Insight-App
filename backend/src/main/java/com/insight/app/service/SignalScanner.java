package com.insight.app.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicLong;

import com.insight.app.model.ThreadItem;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Scans every thread in parallel.
 *
 * Demonstrates MULTITHREADING:
 * - A fixed pool of 4 worker threads processes each thread concurrently.
 * - Each task simulates the latency of reading from a remote source.
 * - Per-task failures are captured with exception handling inside the
 *   future loop — one bad source never aborts the whole sweep.
 */
@Service
public class SignalScanner {

    private static final Logger log = LoggerFactory.getLogger(SignalScanner.class);
    private static final int POOL_SIZE = 4;

    private final ExecutorService executor = Executors.newFixedThreadPool(POOL_SIZE, runnable -> {
        Thread worker = new Thread(runnable, "signal-scanner");
        worker.setDaemon(true);
        return worker;
    });

    private final AtomicLong totalTasksCompleted = new AtomicLong();

    public ScanReport scan(List<ThreadItem> threads) {
        Instant start = Instant.now();

        List<Callable<ThreadItem>> tasks = threads.stream()
                .<Callable<ThreadItem>>map(thread -> () -> {
                    // Simulated I/O latency of fetching the thread's source
                    long latency = 120 + (long) (Math.random() * 180);
                    Thread.sleep(latency);
                    totalTasksCompleted.incrementAndGet();
                    return thread;
                })
                .toList();

        int failed = 0;
        List<ThreadItem> scanned = new ArrayList<>();
        try {
            List<Future<ThreadItem>> futures = executor.invokeAll(tasks);
            for (Future<ThreadItem> future : futures) {
                try {
                    scanned.add(future.get());
                } catch (ExecutionException e) {
                    failed++;
                    log.warn("A scan task failed: {}", e.getCause().toString());
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Signal scan was interrupted", e);
        }

        long durationMs = Duration.between(start, Instant.now()).toMillis();
        log.info("Scan finished: {} ok, {} failed in {} ms (pool of {})",
                scanned.size(), failed, durationMs, POOL_SIZE);
        return new ScanReport(threads.size(), scanned.size(), failed, durationMs, POOL_SIZE, Instant.now());
    }
}
