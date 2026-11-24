package com.insight.app.service;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

import com.insight.app.model.ThreadItem;

import org.springframework.stereotype.Service;

/**
 * Writes the workspace to a timestamped CSV file under data/exports/.
 *
 * Demonstrates FILE HANDLING with try-with-resources: a BufferedWriter
 * streams each row; any I/O failure is wrapped once and surfaced to the
 * global exception handler.
 */
@Service
public class CsvExportService implements Exporter {

    private static final DateTimeFormatter STAMP =
            DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss").withZone(ZoneOffset.UTC);

    @Override
    public Path exportThreads(List<ThreadItem> threads) {
        Path exportsDir = Paths.get("data", "exports");
        Path target = exportsDir.resolve("threads-" + STAMP.format(Instant.now()) + ".csv");

        try {
            Files.createDirectories(exportsDir);
            try (BufferedWriter writer = Files.newBufferedWriter(target, StandardCharsets.UTF_8)) {
                writer.write("id,type,title,source,urgency,signalWeight,updatedAt");
                writer.newLine();
                for (ThreadItem thread : threads) {
                    writer.write(String.join(",",
                            thread.getId(),
                            thread.getType(),
                            csvEscape(thread.getTitle()),
                            csvEscape(thread.getSource()),
                            thread.getUrgency().name(),
                            String.valueOf(thread.signalWeight()),
                            thread.getUpdatedAt().toString()));
                    writer.newLine();
                }
            }
        } catch (IOException e) {
            throw new UncheckedIOException("CSV export failed", e);
        }
        return target;
    }

    private static String csvEscape(String value) {
        String safe = value == null ? "" : value;
        if (safe.contains(",") || safe.contains("\"") || safe.contains("\n")) {
            return "\"" + safe.replace("\"", "\"\"") + "\"";
        }
        return safe;
    }
}
