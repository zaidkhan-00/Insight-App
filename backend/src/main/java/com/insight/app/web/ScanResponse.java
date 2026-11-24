package com.insight.app.web;

import com.insight.app.service.ScanReport;
import com.insight.app.service.SignalDigest;

/** Response of POST /api/scan — the parallel sweep plus the fresh digest. */
public record ScanResponse(ScanReport scan, SignalDigest signal) {
}
