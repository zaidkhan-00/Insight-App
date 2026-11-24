package com.insight.app.service;

import java.nio.file.Path;
import java.util.List;

import com.insight.app.model.ThreadItem;

/**
 * Contract for exporting the workspace — demonstrates an INTERFACE whose
 * implementation performs FILE HANDLING (CSV writer).
 */
public interface Exporter {

    Path exportThreads(List<ThreadItem> threads);
}
