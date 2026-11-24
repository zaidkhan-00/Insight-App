package com.insight.app.web;

/** Response of register/login — an opaque session token plus the public user. */
public record SessionResponse(String token, PublicUser user) {
}
