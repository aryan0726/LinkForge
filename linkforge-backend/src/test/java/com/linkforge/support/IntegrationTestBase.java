package com.linkforge.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linkforge.dto.request.LoginRequest;
import com.linkforge.dto.request.RegisterRequest;
import com.linkforge.entity.Role;
import com.linkforge.entity.User;
import com.linkforge.repository.LinkRepository;
import com.linkforge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Shared setup for the integration tests.
 *
 * These are full-stack tests: a real Spring context, a real PostgreSQL database
 * with real Flyway migrations, and real security filters. Nothing is mocked.
 * That matters here specifically because the defects this suite guards against
 * lived in the seams — a filter that swallowed an exception, a serialiser that
 * emitted a password hash, a counter that lost an update — and none of those
 * are visible if the security chain or the database is stubbed out.
 *
 * Database state is cleared before each test rather than rolled back, because
 * the redirect flow commits inside the request that MockMvc runs on the test
 * thread; a transaction-scoped rollback would not reliably undo it and the next
 * test would inherit the rows.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    protected static final String TEST_PASSWORD = "Password123!";

    /** Distinguishes users created across tests; emails must be unique. */
    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected LinkRepository linkRepository;

    @BeforeEach
    void resetDatabase() {
        // Links first: the foreign key points at users.
        linkRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
    }

    // ------------------------------------------------------------ fixture helpers

    /** A unique, obviously-fake email so tests never collide. */
    protected String uniqueEmail(String prefix) {
        return prefix + SEQUENCE.incrementAndGet() + "@example.test";
    }

    protected RegisterRequest newRegisterRequest(String email) {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test Person");
        request.setUsername("user" + SEQUENCE.incrementAndGet());
        request.setEmail(email);
        request.setPassword(TEST_PASSWORD);
        return request;
    }

    /**
     * Registers a user through the API and returns their bearer token.
     *
     * Going through the endpoint rather than inserting directly means the token
     * is produced by the same code path the frontend uses, so an authentication
     * regression fails the test rather than being bypassed by the fixture.
     */
    protected String registerAndGetToken(RegisterRequest request) throws Exception {

        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(body).get("token").asText();
    }

    /** Creates a user directly in the database, bypassing the API. */
    protected User persistUser(String email, String username) {

        User user = User.builder()
                .fullName("Direct User")
                .email(email)
                .username(username)
                .password("$2a$10$notarealhashnotarealhashnotarealhashnotarealhashnotarealha")
                .role(Role.USER)
                .enabled(true)
                .build();

        return userRepository.saveAndFlush(user);
    }

    protected LoginRequest loginRequest(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }
}
