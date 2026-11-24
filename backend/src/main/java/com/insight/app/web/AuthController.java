package com.insight.app.web;

import com.insight.app.exception.UnauthorizedException;
import com.insight.app.model.User;
import com.insight.app.service.AuthService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public auth endpoints (excluded from the auth interceptor):
 * register, login, session check and logout.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public SessionResponse register(@RequestBody AuthRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public SessionResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public PublicUser me(@RequestHeader(value = "Authorization", required = false) String header) {
        User user = authService.resolve(Bearer.extract(header)).orElseThrow(() -> new UnauthorizedException());
        return PublicUser.from(user);
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader(value = "Authorization", required = false) String header) {
        authService.logout(Bearer.extract(header));
    }
}
