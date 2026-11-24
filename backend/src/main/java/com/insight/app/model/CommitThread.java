package com.insight.app.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * A commit / change thread (pull request, changelog entry).
 * Wide, growing changes score strongly — files changed matters more than lines.
 */
@Entity
@DiscriminatorValue("COMMIT")
public class CommitThread extends ThreadItem {

    @Column(name = "files_changed")
    private int filesChanged;

    @Column(name = "additions")
    private int additions;

    public CommitThread() {
    }

    public CommitThread(String id, String title, String source, String summary,
                        Urgency urgency, Instant updatedAt, int filesChanged, int additions) {
        super(id, title, source, summary, urgency, updatedAt);
        this.filesChanged = filesChanged;
        this.additions = additions;
    }

    @Override
    public String getType() {
        return "COMMIT";
    }

    @Override
    public double signalWeight() {
        return urgencyBoost() + filesChanged * 0.10 + Math.log1p(Math.max(0, additions));
    }

    public int getFilesChanged() {
        return filesChanged;
    }

    public void setFilesChanged(int filesChanged) {
        this.filesChanged = Math.max(0, filesChanged);
    }

    public int getAdditions() {
        return additions;
    }

    public void setAdditions(int additions) {
        this.additions = Math.max(0, additions);
    }
}
