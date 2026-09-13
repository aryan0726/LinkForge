package com.linkforge.api;

import com.linkforge.support.IntegrationTestBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The security boundary: who can reach what, and what the API says when a
 * request is not authenticated.
 *
 * These tests exist because the original behaviour was wrong in a way that was
 * easy to miss: a missing token returned 403 with a completely empty body, and
 * an unparseable token returned 500. Neither tells a client "sign in again".
 */
@DisplayName("Security boundary")
class SecurityBoundaryTest extends IntegrationTestBase {

    // ------------------------------------------------- 401 vs 403 distinction

    @Test
    @DisplayName("no token on a protected endpoint returns 401, not 403")
    void missingTokenReturnsUnauthorized() throws Exception {

        mockMvc.perform(get("/api/links"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.path").value("/api/links"));
    }

    @Test
    @DisplayName("the 401 body is JSON, not empty")
    void unauthorizedResponseHasBody() throws Exception {

        String body = mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isUnauthorized())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // The old behaviour was Content-Length: 0, which left the UI with
        // nothing to display.
        assertThat(body).isNotBlank();

        var json = objectMapper.readTree(body);
        assertThat(json.get("status").asInt()).isEqualTo(401);
        assertThat(json.get("error").asText()).isEqualTo("UNAUTHORIZED");
    }

    @Test
    @DisplayName("a 401 advertises the Bearer scheme")
    void unauthorizedResponseAdvertisesBearer() throws Exception {

        mockMvc.perform(get("/api/links"))
                .andExpect(status().isUnauthorized())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .header().string("WWW-Authenticate", "Bearer"));
    }

    @Test
    @DisplayName("403 is never used for a merely missing token")
    void forbiddenIsNotUsedForMissingToken() throws Exception {

        mockMvc.perform(get("/api/links"))
                .andExpect(status().isUnauthorized());
        // The assertion is the status above; 403 would mean "authenticated but
        // not allowed", which is a different problem with a different fix.
    }

    // --------------------------------------------------------- malformed tokens

    @Test
    @DisplayName("a malformed token returns 401, not 500")
    void malformedTokenReturnsUnauthorized() throws Exception {

        // Previously this produced HTTP 500 with the parser's message in the
        // body — wrong status and a small information leak.
        mockMvc.perform(get("/api/links")
                        .header("Authorization", "Bearer not.a.jwt"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("a token with a valid shape but bad signature returns 401")
    void tamperedSignatureReturnsUnauthorized() throws Exception {

        String token = registerAndGetToken(newRegisterRequest(uniqueEmail("tamper")));

        // Flip the last character of the signature segment.
        String tampered = token.substring(0, token.length() - 1)
                + (token.endsWith("A") ? "B" : "A");

        mockMvc.perform(get("/api/links")
                        .header("Authorization", bearer(tampered)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("a non-Bearer Authorization header returns 401")
    void wrongAuthSchemeReturnsUnauthorized() throws Exception {

        mockMvc.perform(get("/api/links")
                        .header("Authorization", "Basic dXNlcjpwYXNz"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("a Bearer header with no token returns 401")
    void emptyBearerTokenReturnsUnauthorized() throws Exception {

        mockMvc.perform(get("/api/links")
                        .header("Authorization", "Bearer "))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/links")
                        .header("Authorization", "Bearer"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("an expired token returns 401")
    void expiredTokenReturnsUnauthorized() throws Exception {

        // Hand-built with an exp in the past, signed with the same test secret
        // the application uses, so the signature is genuinely valid and only the
        // expiry is wrong — otherwise this would only re-test the signature path.
        String expired = com.linkforge.support.TestTokens.expiredToken();

        mockMvc.perform(get("/api/links")
                        .header("Authorization", bearer(expired)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("a token signed with the wrong key returns 401")
    void foreignKeyTokenReturnsUnauthorized() throws Exception {

        String foreign = com.linkforge.support.TestTokens.tokenSignedWithAnotherKey(
                uniqueEmail("foreign"));

        mockMvc.perform(get("/api/links")
                        .header("Authorization", bearer(foreign)))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------- error disclosure

    @Test
    @DisplayName("no error response exposes a stack trace or internal class name")
    void errorsDoNotLeakInternals() throws Exception {

        String[] bodies = {
                mockMvc.perform(get("/api/links")).andReturn().getResponse().getContentAsString(),
                mockMvc.perform(get("/api/links").header("Authorization", "Bearer nope"))
                        .andReturn().getResponse().getContentAsString(),
                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"a@b.test\",\"password\":\"x\"}"))
                        .andReturn().getResponse().getContentAsString(),
        };

        for (String body : bodies) {
            assertThat(body)
                    .as("error body must not leak internals: %s", body)
                    .doesNotContain("com.linkforge")
                    .doesNotContain("java.lang")
                    .doesNotContain("org.springframework")
                    .doesNotContain("at ")
                    .doesNotContain("Exception");
        }
    }

    // -------------------------------------------------------- public endpoints

    @Test
    @DisplayName("the short-code redirect is reachable without a token")
    void redirectIsPublic() throws Exception {

        // 404 (unknown code), not 401 — proving the request was never asked for
        // credentials in the first place.
        mockMvc.perform(get("/no-such-code"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("registration is reachable without a token")
    void registerIsPublic() throws Exception {

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                newRegisterRequest(uniqueEmail("public")))))
                .andExpect(status().isCreated());
    }

    // ------------------------------------------------------------ unknown paths

    /**
     * Regression test for a real defect found by exercising the running service.
     *
     * An unmatched path under {@code /api/**} returned **500**, not 404. Spring
     * Boot 3.2 replaced {@code NoHandlerFoundException} with
     * {@code NoResourceFoundException} for unmapped requests, and the global
     * handler only knew the old type — so the request fell through to the
     * catch-all branch and was reported as an internal error.
     *
     * 500 for a mistyped URL is actively harmful: it looks like a server fault,
     * it pollutes error dashboards, and it tells a client to retry something that
     * will never succeed.
     */
    @Test
    @DisplayName("an unknown path returns 404, not 500")
    void unknownPathReturnsNotFound() throws Exception {

        String token = registerAndGetToken(newRegisterRequest(uniqueEmail("unknown-path")));

        // Authenticated: authorization passes, so the request reaches the
        // dispatcher and fails to match a handler. This is the case that
        // previously produced a 500.
        mockMvc.perform(get("/api/nonexistent").header("Authorization", bearer(token)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    @DisplayName("an unknown path with no token still returns 401")
    void unknownPathWithoutTokenReturnsUnauthorized() throws Exception {

        // Authorization is evaluated before handler lookup, so an anonymous
        // request to a nonexistent protected path is rejected as unauthenticated
        // rather than disclosing whether the path exists. This is intentional:
        // it avoids confirming which API routes are real to someone who has not
        // signed in.
        mockMvc.perform(get("/api/nonexistent"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("an unknown path never leaks the exception message")
    void unknownPathDoesNotLeakInternals() throws Exception {

        String token = registerAndGetToken(newRegisterRequest(uniqueEmail("no-leak")));

        String body = mockMvc.perform(get("/api/nonexistent")
                        .header("Authorization", bearer(token)))
                .andReturn().getResponse().getContentAsString();

        // Spring's own message reads "No static resource api/nonexistent." —
        // not returned, since it exposes framework internals for no benefit.
        assertThat(body)
                .doesNotContain("No static resource")
                .doesNotContain("NoResourceFoundException")
                .doesNotContain("org.springframework");
    }
}
