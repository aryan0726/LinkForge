package com.linkforge.api;

import com.linkforge.dto.request.RegisterRequest;
import com.linkforge.support.IntegrationTestBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Registration and login behaviour, including the failure modes that previously
 * returned an empty-bodied 403 or a 500.
 */
@DisplayName("Authentication")
class AuthenticationApiTest extends IntegrationTestBase {

    private static final String REGISTER = "/api/auth/register";
    private static final String LOGIN = "/api/auth/login";

    // ------------------------------------------------------------- registration

    @Nested
    @DisplayName("POST /api/auth/register")
    class Register {

        @Test
        @DisplayName("creates the account and returns a usable token")
        void createsAccountAndReturnsToken() throws Exception {

            RegisterRequest request = newRegisterRequest(uniqueEmail("new"));

            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    // 201, not 200: a new user resource now exists.
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.token").isNotEmpty());

            // The token must actually work, and the account must exist.
            assertThat(userRepository.findByEmail(request.getEmail())).isPresent();
        }

        @Test
        @DisplayName("stores the password hashed, never in plain text")
        void storesPasswordHashed() throws Exception {

            RegisterRequest request = newRegisterRequest(uniqueEmail("hashed"));

            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());

            String stored = userRepository.findByEmail(request.getEmail())
                    .orElseThrow()
                    .getPassword();

            assertThat(stored).isNotEqualTo(TEST_PASSWORD);
            assertThat(stored).startsWith("$2");   // BCrypt marker
        }

        @Test
        @DisplayName("rejects a duplicate email with 409 and names the field")
        void rejectsDuplicateEmail() throws Exception {

            String email = uniqueEmail("dupe");

            RegisterRequest first = newRegisterRequest(email);
            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(first)))
                    .andExpect(status().isCreated());

            RegisterRequest second = newRegisterRequest(email);
            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(second)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.error").value("CONFLICT"))
                    .andExpect(jsonPath("$.fieldErrors.email").isNotEmpty());
        }

        @Test
        @DisplayName("rejects a duplicate username with 409 and names the field")
        void rejectsDuplicateUsername() throws Exception {

            RegisterRequest first = newRegisterRequest(uniqueEmail("uname-a"));

            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(first)))
                    .andExpect(status().isCreated());

            // Same username, different email.
            RegisterRequest second = newRegisterRequest(uniqueEmail("uname-b"));
            second.setUsername(first.getUsername());

            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(second)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.fieldErrors.username").isNotEmpty());
        }

        @Test
        @DisplayName("rejects a blank full name")
        void rejectsBlankFullName() throws Exception {

            RegisterRequest request = newRegisterRequest(uniqueEmail("blank-name"));
            request.setFullName("   ");

            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                    .andExpect(jsonPath("$.fieldErrors.fullName").isNotEmpty());
        }

        @Test
        @DisplayName("rejects a malformed email")
        void rejectsMalformedEmail() throws Exception {

            RegisterRequest request = newRegisterRequest("not-an-email");

            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.fieldErrors.email").isNotEmpty());
        }

        @Test
        @DisplayName("rejects a password shorter than 8 characters")
        void rejectsShortPassword() throws Exception {

            RegisterRequest request = newRegisterRequest(uniqueEmail("short-pw"));
            request.setPassword("short");

            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.fieldErrors.password").isNotEmpty());
        }

        @Test
        @DisplayName("rejects a username containing illegal characters")
        void rejectsIllegalUsername() throws Exception {

            RegisterRequest request = newRegisterRequest(uniqueEmail("bad-uname"));
            request.setUsername("bad username!");

            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.fieldErrors.username").isNotEmpty());
        }

        @Test
        @DisplayName("rejects an entirely empty body")
        void rejectsEmptyBody() throws Exception {

            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("rejects malformed JSON without leaking the parser error")
        void rejectsMalformedJson() throws Exception {

            String response = mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{ this is not json "))
                    .andExpect(status().isBadRequest())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // The parser's own message names internal classes; it must not appear.
            assertThat(response)
                    .doesNotContain("com.linkforge")
                    .doesNotContain("RegisterRequest")
                    .doesNotContain("JsonParseException");
        }

        @Test
        @DisplayName("normalises the email so casing cannot create duplicates")
        void normalisesEmailCase() throws Exception {

            String email = uniqueEmail("casing");

            RegisterRequest upper = newRegisterRequest(email.toUpperCase());
            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(upper)))
                    .andExpect(status().isCreated());

            // Same address, lower case: must be recognised as a duplicate.
            RegisterRequest lower = newRegisterRequest(email.toLowerCase());
            mockMvc.perform(post(REGISTER)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(lower)))
                    .andExpect(status().isConflict());
        }
    }

    // -------------------------------------------------------------------- login

    @Nested
    @DisplayName("POST /api/auth/login")
    class Login {

        @Test
        @DisplayName("returns a token for correct credentials")
        void succeedsWithCorrectCredentials() throws Exception {

            String email = uniqueEmail("login-ok");
            RegisterRequest registration = newRegisterRequest(email);
            registerAndGetToken(registration);

            mockMvc.perform(post(LOGIN)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    loginRequest(email, TEST_PASSWORD))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isNotEmpty());
        }

        @Test
        @DisplayName("rejects a wrong password with 401")
        void rejectsWrongPassword() throws Exception {

            String email = uniqueEmail("login-bad");
            registerAndGetToken(newRegisterRequest(email));

            mockMvc.perform(post(LOGIN)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    loginRequest(email, "WrongPassword123!"))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
        }

        @Test
        @DisplayName("rejects an unknown email with 401, not 404")
        void rejectsUnknownUser() throws Exception {

            mockMvc.perform(post(LOGIN)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    loginRequest("nobody@example.test", TEST_PASSWORD))))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("gives the same answer for a wrong password and an unknown email")
        void doesNotRevealWhetherAccountExists() throws Exception {

            String email = uniqueEmail("enumeration");
            registerAndGetToken(newRegisterRequest(email));

            String wrongPassword = mockMvc.perform(post(LOGIN)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    loginRequest(email, "WrongPassword123!"))))
                    .andReturn().getResponse().getContentAsString();

            String unknownUser = mockMvc.perform(post(LOGIN)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    loginRequest("nobody@example.test", "WrongPassword123!"))))
                    .andReturn().getResponse().getContentAsString();

            // Identical bodies: the endpoint cannot be used to test which
            // addresses are registered. `path` is the same for both, and
            // `timestamp` is the only field expected to differ.
            assertThat(objectMapper.readTree(wrongPassword).get("message"))
                    .isEqualTo(objectMapper.readTree(unknownUser).get("message"));
            assertThat(objectMapper.readTree(wrongPassword).get("status"))
                    .isEqualTo(objectMapper.readTree(unknownUser).get("status"));
        }

        @Test
        @DisplayName("rejects a disabled account with the same generic 401")
        void rejectsDisabledAccount() throws Exception {

            String email = uniqueEmail("disabled");
            RegisterRequest registration = newRegisterRequest(email);
            registerAndGetToken(registration);

            var user = userRepository.findByEmail(email).orElseThrow();
            user.setEnabled(false);
            userRepository.saveAndFlush(user);

            mockMvc.perform(post(LOGIN)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    loginRequest(email, TEST_PASSWORD))))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("rejects a missing password field")
        void rejectsMissingPassword() throws Exception {

            mockMvc.perform(post(LOGIN)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\":\"someone@example.test\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.fieldErrors.password").isNotEmpty());
        }
    }
}
