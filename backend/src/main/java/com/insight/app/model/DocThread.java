package com.insight.app.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * A document thread (spec, brief, proposal being written together).
 * Docs weigh activity lightly — a doc is rarely today's loudest signal.
 */
@Entity
@DiscriminatorValue("DOC")
public class DocThread extends ThreadItem {

    @Column(name = "section_count")
    private int sectionCount;

    public DocThread() {
    }

    public DocThread(String id, String title, String source, String summary,
                     Urgency urgency, Instant updatedAt, int sectionCount) {
        super(id, title, source, summary, urgency, updatedAt);
        this.sectionCount = sectionCount;
    }

    @Override
    public String getType() {
        return "DOC";
    }

    @Override
    public double signalWeight() {
        return urgencyBoost() + sectionCount * 0.02;
    }

    public int getSectionCount() {
        return sectionCount;
    }

    public void setSectionCount(int sectionCount) {
        this.sectionCount = Math.max(0, sectionCount);
    }
}
