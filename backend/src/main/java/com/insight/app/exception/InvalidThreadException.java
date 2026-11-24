package com.insight.app.exception;

/** Thrown when user input breaks the rules — mapped to HTTP 400. */
public class InvalidThreadException extends RuntimeException {

    public InvalidThreadException(String message) {
        super(message);
    }
}
