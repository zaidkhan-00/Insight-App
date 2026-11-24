package com.insight.app.web;

import com.insight.app.service.DigestEngine;
import com.insight.app.service.ScanReport;
import com.insight.app.service.SignalDigest;
import com.insight.app.service.SignalScanner;
import com.insight.app.service.ThreadService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The "one clear signal" endpoints.
 */
@RestController
@RequestMapping("/api")
public class SignalController {

    private final ThreadService threadService;
    private final DigestEngine digestEngine;
    private final SignalScanner scanner;

    public SignalController(ThreadService threadService, DigestEngine digestEngine, SignalScanner scanner) {
        this.threadService = threadService;
        this.digestEngine = digestEngine;
        this.scanner = scanner;
    }

    @GetMapping("/signal/today")
    public SignalDigest today() {
        return digestEngine.computeDigest(threadService.all());
    }

    /** Runs the multithreaded scan sweep, then recomputes the digest. */
    @PostMapping("/scan")
    public ScanResponse scan() {
        ScanReport report = scanner.scan(threadService.all());
        SignalDigest digest = digestEngine.computeDigest(threadService.all());
        return new ScanResponse(report, digest);
    }
}
