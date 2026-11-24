package com.insight.app.model;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;

/**
 * Base class of every entry in the workspace.
 *
 * Demonstrates INHERITANCE + POLYMORPHISM:
 * - ChatThread, DocThread and CommitThread all extend this class.
 * - {@link #signalWeight()} is abstract: every subclass scores itself differently,
 *   and the digest engine picks the highest score without knowing concrete types.
 * - {@link #urgencyBoost()} is a final shared behaviour inherited by all subclasses.
 *
 * Persisted in PostgreSQL (table "threads") using single-table inheritance with
 * a "type" discriminator column. The @JsonTypeInfo annotation keeps the concrete
 * subclass as the "type" JSON property for the API.
 */
@Entity
@Table(name = "threads")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.STRING)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = ChatThread.class, name = "CHAT"),
        @JsonSubTypes.Type(value = DocThread.class, name = "DOC"),
        @JsonSubTypes.Type(value = CommitThread.class, name = "COMMIT")
})
public abstract class ThreadItem {

    @Id
    @Column(name = "id", nullable = false, length = 64)
    private String id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "source", nullable = false, length = 255)
    private String source;

    @Column(name = "summary", length = 2000)
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency", nullable = false, length = 16)
    private Urgency urgency;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ThreadItem() {
        // Required by Jackson
    }

    protected ThreadItem(String id, String title, String source, String summary,
                         Urgency urgency, Instant updatedAt) {
        this.id = id;
        this.title = title;
        this.source = source;
        this.summary = summary;
        this.urgency = urgency;
        this.updatedAt = updatedAt;
    }

    /** Discriminator used by JSON serialization and the UI badges. */
    @JsonIgnore
    public abstract String getType();

    /** Polymorphic score — each subclass weighs its own activity differently. */
    @JsonProperty("signalWeight")
    public abstract double signalWeight();

    /** Shared scoring component inherited by every thread type. */
    public final double urgencyBoost() {
        return switch (urgency) {
            case LOW -> 0.0;
            case MEDIUM -> 1.0;
            case HIGH -> 2.5;
            case CRITICAL -> 4.0;
        };
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Urgency getUrgency() {
        return urgency;
    }

    public void setUrgency(Urgency urgency) {
        this.urgency = urgency;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
