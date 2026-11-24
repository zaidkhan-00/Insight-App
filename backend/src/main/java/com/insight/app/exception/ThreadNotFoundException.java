package com.insight.app.exception;

/** Thrown when a thread id does not exist — mapped to HTTP 404. */
public class ThreadNotFoundException extends RuntimeException {

    public ThreadNotFoundException(String id) {
        super("No thread found with id '" + id + "'.");
    }
}
