package com.insight.app.service;

import java.util.List;

import com.insight.app.model.ThreadItem;

import org.springframework.stereotype.Service;

/**
 * Distills all threads into the single most important one.
 *
 * Demonstrates an INTERFACE: the controller depends on this contract,
 * not on this implementation — a smarter engine (ML, external API)
 * could replace it without changing callers.
 */
public interface DigestEngine {

    SignalDigest computeDigest(List<ThreadItem> threads);
}
