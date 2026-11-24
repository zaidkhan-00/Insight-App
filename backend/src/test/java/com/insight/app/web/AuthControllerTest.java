package com.insight.app.web;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.insight.app.service.AuthService;
import com.insight.app.support.InMemoryAuthRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

/**
 * HTTP-level tests for /api/auth/** using standalone MockMvc.
 *
 * No Spring Boot context and no PostgreSQL: the controller is wired to a real
 * {@link AuthService} backed by an in-memory user store, with the production
 * {@link GlobalExceptionHandler} so status codes and error bodies are real.
 * Maps to the AUTH-*-API cases in docs/06-login-test-cases.md.
 */
class AuthControllerTest {

    private static final String EMAIL = "demo@insight.app";
    private static final String NAME = "Demo User";
    private static final String PASSWORD = "insight123";
    private static final String LOGIN = "/api/auth/login";
    private static final String REGISTER = "/api/auth/register";
    private static final String ME = "/api/auth/me";

    private AuthService authService;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        authService = new AuthService(new InMemoryAuthRepository());
        mvc = MockMvcBuilders.standaloneSetup(new AuthController(authService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private String seedUserAndToken() {
        return authService.register(new AuthRequest(EMAIL, NAME, PASSWORD)).token();
    }

    private String body(String email, String name, String password) {
        StringBuilder json = new StringBuilder("{");
        if (email != null) {
            json.append("\"email\":\"").append(email).append("\",");
        }
        if (name != null) {
            json.append("\"name\":\"").append(name).append("\",");
        }
        if (password != null) {
            json.append("\"password\":\"").append(password).append("\",");
        }
        if (json.charAt(json.length() - 1) == ',') {
            json.setLength(json.length() - 1);
        }
        return json.append("}").toString();
    }

    // -------------------------------------------------------------- POST login

    @Test
    void loginReturns200WithTokenAndPublicUser() throws Exception {
        seedUserAndToken();

        mvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(EMAIL, null, PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(EMAIL))
                .andExpect(jsonPath("$.user.name").value(NAME))
                .andExpect(jsonPath("$.user.createdAt").isNotEmpty());
    }

    @Test
    void loginNeverLeaksThePasswordHashOrSalt() throws Exception {
        seedUserAndToken();

        mvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(EMAIL, null, PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.user.salt").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void loginAcceptsACaseInsensitiveEmail() throws Exception {
        seedUserAndToken();

        mvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("DEMO@Insight.App", null, PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(EMAIL));
    }

    @Test
    void loginWithWrongPasswordReturns401() throws Exception {
        seedUserAndToken();

        mvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(EMAIL, null, "wrong-password")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Email or password is incorrect."));
    }

    @Test
    void loginWithUnknownEmailReturns401WithTheSameMessage() throws Exception {
        seedUserAndToken();

        mvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("nobody@insight.app", null, PASSWORD)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email or password is incorrect."));
    }

    @Test
    void loginWithMalformedEmailReturns400() throws Exception {
        mvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("not-an-email", null, PASSWORD)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Enter a valid email address."));
    }

    @Test
    void loginWithEmptyBodyFieldsReturns400() throws Exception {
        mvc.perform(post(LOGIN).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is required."));
    }

    @Test
    void loginWithShortPasswordReturns400() throws Exception {
        mvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(EMAIL, null, "short")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password must be at least 8 characters."));
    }

    @Test
    void loginWithBrokenJsonReturns400() throws Exception {
        mvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Malformed request body")));
    }

    /**
     * Known defect (EDGE-02 in docs/06-login-test-cases.md): a request with a
     * missing/foreign Content-Type raises HttpMediaTypeNotSupportedException,
     * which GlobalExceptionHandler's catch-all turns into a 500.
     * When that is fixed to 415, update this test to isUnsupportedMediaType().
     */
    @Test
    void loginWithoutAJsonContentTypeCurrentlyReturns500_knownDefect() throws Exception {
        mvc.perform(post(LOGIN).content(body(EMAIL, null, PASSWORD)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Something went wrong on our side. Try again."));
    }

    // ----------------------------------------------------------- POST register

    @Test
    void registerReturns200WithTokenAndUser() throws Exception {
        mvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("new.user@insight.app", "New User", PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("new.user@insight.app"))
                .andExpect(jsonPath("$.user.name").value("New User"));
    }

    @Test
    void registerWithDuplicateEmailReturns409() throws Exception {
        seedUserAndToken();

        mvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("DEMO@insight.app", NAME, PASSWORD)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("An account with email 'demo@insight.app' already exists."));
    }

    @Test
    void registerWithoutNameReturns400() throws Exception {
        mvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("new.user@insight.app", null, PASSWORD)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Your name is required."));
    }

    @Test
    void registerWithShortPasswordReturns400() throws Exception {
        mvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("new.user@insight.app", "New User", "1234567")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password must be at least 8 characters."));
    }

    // ---------------------------------------------------------- GET me / logout

    @Test
    void meReturnsTheSignedInUser() throws Exception {
        String token = seedUserAndToken();

        mvc.perform(get(ME).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.name").value(NAME))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void meWithoutAuthorizationHeaderReturns401() throws Exception {
        mvc.perform(get(ME))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Sign in to continue."));
    }

    @Test
    void meWithAnUnknownTokenReturns401() throws Exception {
        mvc.perform(get(ME).header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Sign in to continue."));
    }

    @Test
    void meWithAMalformedAuthorizationHeaderReturns401() throws Exception {
        mvc.perform(get(ME).header("Authorization", "Token abc"))
                .andExpect(status().isUnauthorized());

        mvc.perform(get(ME).header("Authorization", "Bearer "))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meWithDeeplyNestedBearerPrefixReturns401() throws Exception {
        mvc.perform(get(ME).header("Authorization", "Bearer Bearer abc"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutInvalidatesTheSession() throws Exception {
        String token = seedUserAndToken();

        mvc.perform(post("/api/auth/logout").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mvc.perform(get(ME).header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutWithoutATokenDoesNotFail() throws Exception {
        mvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk());
    }

    @Test
    void logoutOnlyEndsTheCurrentSession() throws Exception {
        seedUserAndToken();
        String first = authService.login(new AuthRequest(EMAIL, null, PASSWORD)).token();
        String second = authService.login(new AuthRequest(EMAIL, null, PASSWORD)).token();

        mvc.perform(post("/api/auth/logout").header("Authorization", "Bearer " + first))
                .andExpect(status().isOk());

        mvc.perform(get(ME).header("Authorization", "Bearer " + first))
                .andExpect(status().isUnauthorized());
        mvc.perform(get(ME).header("Authorization", "Bearer " + second))
                .andExpect(status().isOk());
    }
}
