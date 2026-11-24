package com.insight.app.exception;

/** Registration with an email that already exists — mapped to HTTP 409. */
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String email) {
        super("An account with email '" + email + "' already exists.");
    }
}
