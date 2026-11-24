package com.insight.app.exception;

/** Malformed login/registration input — mapped to HTTP 400. */
public class InvalidAuthException extends RuntimeException {

    public InvalidAuthException(String message) {
        super(message);
    }
}
