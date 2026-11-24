package com.insight.app.exception;

/** Wrong email or password at login — mapped to HTTP 401. */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Email or password is incorrect.");
    }
}
