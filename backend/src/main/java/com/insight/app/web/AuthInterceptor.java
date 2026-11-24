package com.insight.app.web;

import com.insight.app.exception.UnauthorizedException;
import com.insight.app.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Guards every /api/** route except /api/auth/**.
 * Requires "Authorization: Bearer <token>"; unknown or expired tokens
 * fail with UnauthorizedException → 401 via the global handler.
 */
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;

    public AuthInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // CORS preflight and non-handler requests pass through
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || !(handler instanceof HandlerMethod)) {
            return true;
        }
        String token = Bearer.extract(request.getHeader("Authorization"));
        if (token == null || authService.resolve(token).isEmpty()) {
            throw new UnauthorizedException("Session expired or missing — sign in again.");
        }
        return true;
    }
}
