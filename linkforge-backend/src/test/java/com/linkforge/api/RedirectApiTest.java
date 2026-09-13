package com.linkforge.api;

import com.linkforge.entity.Link;
import com.linkforge.repository.LinkRepository;
import com.linkforge.support.IntegrationTestBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Short-link resolution: the public redirect, the not-found case, and the click
 * counter — including the concurrent case that the original read-modify-write
 * implementation got wrong.
 */
@DisplayName("Redirect")
class RedirectApiTest extends IntegrationTestBase {

    @Autowired
    private LinkRepository links;

    /** Creates a link for a fresh user and returns its short code. */
    private String createLink(String originalUrl) throws Exception {

        String token = registerAndGetToken(newRegisterRequest(uniqueEmail("redirect")));

        String body = mockMvc.perform(post("/api/links")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("originalUrl", originalUrl))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(body).get("shortCode").asText();
    }

    @Test
    @DisplayName("a valid short code redirects to the original URL")
    void validShortCodeRedirects() throws Exception {

        String code = createLink("https://example.com/target-page");

        mockMvc.perform(get("/" + code))
                .andExpect(status().isFound())   // 302
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .header().string("Location", "https://example.com/target-page"));
    }

    @Test
    @DisplayName("an unknown short code returns 404, not 401 or 500")
    void unknownShortCodeReturnsNotFound() throws Exception {

        mockMvc.perform(get("/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    @DisplayName("a redirect does not require a token")
    void redirectNeedsNoToken() throws Exception {

        String code = createLink("https://example.com/public");

        // No Authorization header at all.
        mockMvc.perform(get("/" + code))
                .andExpect(status().isFound());
    }

    @Test
    @DisplayName("one visit increments the click count by exactly one")
    void singleClickIncrements() throws Exception {

        String code = createLink("https://example.com/counted");

        mockMvc.perform(get("/" + code)).andExpect(status().isFound());

        assertThat(clickCountOf(code)).isEqualTo(1L);
    }

    @Test
    @DisplayName("successive visits accumulate")
    void repeatedClicksAccumulate() throws Exception {

        String code = createLink("https://example.com/repeat");

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get("/" + code)).andExpect(status().isFound());
        }

        assertThat(clickCountOf(code)).isEqualTo(5L);
    }

    /**
     * The regression test for the lost-update bug.
     *
     * The original implementation read {@code clickCount}, added one in Java, and
     * saved the entity back. Under concurrency, several requests read the same
     * starting value and their writes overwrote each other, so the final count
     * was less than the number of requests. Now the arithmetic happens inside a
     * single {@code UPDATE ... SET click_count = click_count + 1}, and the row
     * lock serialises the increments.
     *
     * The requests are issued in parallel on a real thread pool against the real
     * database. MockMvc is thread-safe for concurrent {@code perform} calls
     * because each one builds an independent request; nothing here shares
     * mutable state between threads except the counter under test, which lives in
     * the database.
     */
    @Test
    @DisplayName("concurrent visits each count — no lost updates")
    void concurrentClicksAreNotLost() throws Exception {

        String code = createLink("https://example.com/concurrent");

        int concurrentRequests = 25;

        try (ExecutorService pool = Executors.newFixedThreadPool(10)) {

            Callable<Integer> visit = () -> mockMvc.perform(get("/" + code))
                    .andReturn()
                    .getResponse()
                    .getStatus();

            var futures = IntStream.range(0, concurrentRequests)
                    .mapToObj(i -> pool.submit(visit))
                    .toList();

            for (Future<Integer> future : futures) {
                assertThat(future.get(30, TimeUnit.SECONDS))
                        .as("every redirect should succeed")
                        .isEqualTo(302);
            }
        }

        // Exactly N, not "at least one" and not "fewer than N". A read-modify-write
        // implementation fails this assertion; the atomic UPDATE passes it.
        assertThat(clickCountOf(code))
                .as("all %d concurrent clicks must be counted", concurrentRequests)
                .isEqualTo((long) concurrentRequests);
    }

    @Test
    @DisplayName("an unvisited link stays at zero")
    void unvisitedLinkHasZeroClicks() throws Exception {

        String code = createLink("https://example.com/untouched");

        assertThat(clickCountOf(code)).isZero();
    }

    @Test
    @DisplayName("an inactive link is not redirected")
    void inactiveLinkReturnsNotFound() throws Exception {

        String code = createLink("https://example.com/deactivated");

        Link link = links.findByShortCode(code).orElseThrow();
        link.setActive(false);
        links.saveAndFlush(link);

        // Active links are the only reachable ones; a deactivated link is
        // indistinguishable from one that never existed.
        mockMvc.perform(get("/" + code))
                .andExpect(status().isNotFound());
    }

    /** Reads the current click count straight from the database. */
    private long clickCountOf(String shortCode) {
        return links.findByShortCode(shortCode).orElseThrow().getClickCount();
    }
}
