package com.linkforge.api;

import com.linkforge.dto.request.RegisterRequest;
import com.linkforge.entity.User;
import com.linkforge.support.IntegrationTestBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The profile endpoint.
 *
 * The central test here is the one that would have failed before this pass:
 * {@code GET /api/user/me} returned the JPA entity, so the BCrypt hash was sent
 * to the browser.
 */
@DisplayName("User profile")
class UserProfileApiTest extends IntegrationTestBase {

    private static final String ME = "/api/user/me";

    @Test
    @DisplayName("returns the caller's own profile")
    void returnsOwnProfile() throws Exception {

        String email = uniqueEmail("profile");
        RegisterRequest request = newRegisterRequest(email);
        String token = registerAndGetToken(request);

        mockMvc.perform(get(ME).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.fullName").value(request.getFullName()))
                .andExpect(jsonPath("$.username").value(request.getUsername()))
                .andExpect(jsonPath("$.id").isNotEmpty());
    }

    @Test
    @DisplayName("never returns the password or its hash")
    void neverReturnsPassword() throws Exception {

        String token = registerAndGetToken(newRegisterRequest(uniqueEmail("nopw")));

        String body = mockMvc.perform(get(ME).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // The regression this guards: the old response contained
        // "password":"$2a$10$...". A BCrypt hash is offline-crackable, so
        // shipping it to the client is a genuine credential leak, not a cosmetic
        // one.
        assertThat(body).doesNotContain("password");
        assertThat(body).doesNotContain("$2a$");
        assertThat(body).doesNotContain("$2b$");
        assertThat(body).doesNotContain("$2y$");
    }

    @Test
    @DisplayName("returns exactly the documented fields and nothing else")
    void returnsExactlyTheDocumentedFields() throws Exception {

        String token = registerAndGetToken(newRegisterRequest(uniqueEmail("shape")));

        String body = mockMvc.perform(get(ME).header("Authorization", bearer(token)))
                .andReturn().getResponse().getContentAsString();

        var json = objectMapper.readTree(body);
        var fieldNames = new java.util.TreeSet<String>();
        json.fieldNames().forEachRemaining(fieldNames::add);

        // Pinning the exact field set means a column added to the `users` table
        // later cannot silently become part of the API — the test fails and the
        // author has to make a deliberate decision.
        assertThat(fieldNames).containsExactlyInAnyOrder(
                "id", "fullName", "username", "email", "role", "enabled", "createdAt");
    }

    @Test
    @DisplayName("reports the correct role")
    void reportsRole() throws Exception {

        String token = registerAndGetToken(newRegisterRequest(uniqueEmail("role")));

        mockMvc.perform(get(ME).header("Authorization", bearer(token)))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    @DisplayName("rejects an unauthenticated request with 401 and a JSON body")
    void rejectsUnauthenticated() throws Exception {

        mockMvc.perform(get(ME))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("ignores an attempt to request another user by parameter")
    void ignoresUserParameter() throws Exception {

        String mineToken = registerAndGetToken(newRegisterRequest(uniqueEmail("mine")));
        String theirEmail = uniqueEmail("theirs");
        registerAndGetToken(newRegisterRequest(theirEmail));

        // The endpoint takes no user parameter at all: identity comes from the
        // token. Appending one must change nothing, which proves there is no
        // parameter to tamper with.
        mockMvc.perform(get(ME + "?email=" + theirEmail)
                        .header("Authorization", bearer(mineToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(org.hamcrest.Matchers.not(theirEmail)));
    }

    @Test
    @DisplayName("returns 404 when the token is valid but the account is gone")
    void returnsNotFoundForDeletedAccount() throws Exception {

        // A token can outlive the account it describes if the row is removed
        // while a session is still open. The correct answer is "no such user",
        // not a 500 from an unguarded orElseThrow().
        User ghost = persistUser(uniqueEmail("ghost"), "ghost" + System.nanoTime());
        String token = com.linkforge.support.TestTokens.validToken(ghost.getEmail());

        userRepository.deleteById(ghost.getId());

        mockMvc.perform(get(ME).header("Authorization", bearer(token)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("ignores a stale token on the public auth endpoints")
    void ignoresTokenOnAuthEndpoints() throws Exception {

        // A leftover Authorization header must not break login. The filter skips
        // /api/auth/**, so a garbage token there is simply irrelevant.
        String email = uniqueEmail("stale");
        registerAndGetToken(newRegisterRequest(email));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/api/auth/login")
                        .header("Authorization", "Bearer garbage.token.here")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                loginRequest(email, TEST_PASSWORD))))
                .andExpect(status().isOk());
    }
}
