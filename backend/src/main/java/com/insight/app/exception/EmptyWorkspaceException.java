package com.insight.app.exception;

/** Thrown when the digest is requested but the workspace has no threads — mapped to HTTP 409. */
public class EmptyWorkspaceException extends RuntimeException {

    public EmptyWorkspaceException(String message) {
        super(message);
    }
}
