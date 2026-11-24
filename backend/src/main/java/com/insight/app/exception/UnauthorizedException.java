package com.insight.app.exception;

/** Bad session token or missing auth — mapped to HTTP 401. */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException() {
        super("Sign in to continue.");
    }

    public UnauthorizedException(String message) {
        super(message);
    }
}
