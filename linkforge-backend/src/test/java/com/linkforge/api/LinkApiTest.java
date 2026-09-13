package com.linkforge.api;

import com.linkforge.dto.request.RegisterRequest;
import com.linkforge.entity.Link;
import com.linkforge.support.IntegrationTestBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Link creation and listing, and the URL validation that guards creation.
 */
@DisplayName("Links")
class LinkApiTest extends IntegrationTestBase {

    private static final String LINKS = "/api/links";

    private String json(String originalUrl) throws Exception {
        return objectMapper.writeValueAsString(Map.of("originalUrl", originalUrl));
    }

    // ------------------------------------------------------------------ create

    @Nested
    @DisplayName("POST /api/links")
    class Create {

        @Test
        @DisplayName("creates a short link and returns 201")
        void createsShortLink() throws Exception {

            String token = registerAndGetToken(newRegisterRequest(uniqueEmail("create")));

            mockMvc.perform(post(LINKS)
                            .header("Authorization", bearer(token))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json("https://example.com/some/page?q=1")))
                    // 201: a new link resource now exists.
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.shortCode").isNotEmpty())
                    .andExpect(jsonPath("$.originalUrl").value("https://example.com/some/page?q=1"))
                    .andExpect(jsonPath("$.clickCount").value(0));
        }

        @Test
        @DisplayName("builds shortUrl from the configured base URL, not localhost")
        void usesConfiguredBaseUrl() throws Exception {

            String token = registerAndGetToken(newRegisterRequest(uniqueEmail("baseurl")));

            String body = mockMvc.perform(post(LINKS)
                            .header("Authorization", bearer(token))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json("https://example.com")))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            String shortUrl = objectMapper.readTree(body).get("shortUrl").asText();

            // `app.base-url` is http://test.linkforge.local in the test profile.
            // A hard-coded localhost:8080 here would mean the value is still
            // baked into the code rather than read from configuration.
            assertThat(shortUrl).startsWith("http://test.linkforge.local/");
            assertThat(shortUrl).doesNotContain("localhost:8080");
        }

        @Test
        @DisplayName("rejects a value that is not a URL")
        void rejectsNonUrl() throws Exception {

            String token = registerAndGetToken(newRegisterRequest(uniqueEmail("noturl")));

            // Each of these was previously shortened successfully.
            for (String invalid : new String[]{"hello", "abc", "not-a-url", "example"}) {
                mockMvc.perform(post(LINKS)
                                .header("Authorization", bearer(token))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json(invalid)))
                        .andExpect(status().isBadRequest())
                        .andExpect(jsonPath("$.fieldErrors.originalUrl").isNotEmpty());
            }
        }

        @Test
        @DisplayName("rejects a URL with a non-http scheme")
        void rejectsNonHttpScheme() throws Exception {

            String token = registerAndGetToken(newRegisterRequest(uniqueEmail("scheme")));

            for (String invalid : new String[]{
                    "javascript:alert(1)",
                    "ftp://example.com/file",
                    "mailto:someone@example.com",
                    "data:text/html,<script>alert(1)</script>"}) {

                mockMvc.perform(post(LINKS)
                                .header("Authorization", bearer(token))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json(invalid)))
                        .andExpect(status().isBadRequest());
            }
        }

        @Test
        @DisplayName("rejects a blank or missing URL")
        void rejectsBlankUrl() throws Exception {

            String token = registerAndGetToken(newRegisterRequest(uniqueEmail("blankurl")));

            mockMvc.perform(post(LINKS)
                            .header("Authorization", bearer(token))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.fieldErrors.originalUrl").isNotEmpty());

            mockMvc.perform(post(LINKS)
                            .header("Authorization", bearer(token))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json("   ")))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("accepts legitimate http and https URLs")
        void acceptsLegitimateUrls() throws Exception {

            String token = registerAndGetToken(newRegisterRequest(uniqueEmail("legit")));

            // The validator must not be so strict that it rejects real URLs.
            for (String valid : new String[]{
                    "https://example.com",
                    "http://example.com",
                    "https://example.com/very/deep/path?with=query&and=more#fragment",
                    "https://sub.domain.example.co.uk:8443/path",
                    "http://localhost:3000/dev",
                    "https://192.168.1.10:8080/internal"}) {

                mockMvc.perform(post(LINKS)
                                .header("Authorization", bearer(token))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json(valid)))
                        .andExpect(status().isCreated());
            }
        }

        @Test
        @DisplayName("rejects an unauthenticated request")
        void rejectsUnauthenticated() throws Exception {

            mockMvc.perform(post(LINKS)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json("https://example.com")))
                    .andExpect(status().isUnauthorized());

            // Nothing was persisted.
            assertThat(linkRepository.count()).isZero();
        }

        @Test
        @DisplayName("generates a distinct code per link")
        void generatesDistinctCodes() throws Exception {

            String token = registerAndGetToken(newRegisterRequest(uniqueEmail("distinct")));

            String first = objectMapper.readTree(
                    mockMvc.perform(post(LINKS)
                                    .header("Authorization", bearer(token))
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(json("https://example.com/one")))
                            .andReturn().getResponse().getContentAsString())
                    .get("shortCode").asText();

            String second = objectMapper.readTree(
                    mockMvc.perform(post(LINKS)
                                    .header("Authorization", bearer(token))
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(json("https://example.com/two")))
                            .andReturn().getResponse().getContentAsString())
                    .get("shortCode").asText();

            assertThat(first).isNotEqualTo(second);
        }
    }

    // ------------------------------------------------------------------- list

    @Nested
    @DisplayName("GET /api/links")
    class List_ {

        @Test
        @DisplayName("returns only the caller's own links")
        void returnsOnlyOwnLinks() throws Exception {

            String ownerToken = registerAndGetToken(newRegisterRequest(uniqueEmail("owner")));
            String otherToken = registerAndGetToken(newRegisterRequest(uniqueEmail("stranger")));

            mockMvc.perform(post(LINKS)
                            .header("Authorization", bearer(ownerToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json("https://example.com/owners-link")))
                    .andExpect(status().isCreated());

            // The owner sees one link.
            mockMvc.perform(get(LINKS).header("Authorization", bearer(ownerToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].originalUrl").value("https://example.com/owners-link"));

            // A different authenticated user sees an empty list, not the owner's
            // links. This is the data-isolation guarantee: it holds because the
            // query is scoped by user, not because the client asked politely.
            mockMvc.perform(get(LINKS).header("Authorization", bearer(otherToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("returns an empty list for a user with no links")
        void returnsEmptyList() throws Exception {

            String token = registerAndGetToken(newRegisterRequest(uniqueEmail("empty")));

            mockMvc.perform(get(LINKS).header("Authorization", bearer(token)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("rejects an unauthenticated request")
        void rejectsUnauthenticated() throws Exception {

            mockMvc.perform(get(LINKS))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("never exposes the owning user's details")
        void doesNotExposeOwner() throws Exception {

            String token = registerAndGetToken(newRegisterRequest(uniqueEmail("shape")));

            mockMvc.perform(post(LINKS)
                            .header("Authorization", bearer(token))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json("https://example.com/shape")))
                    .andExpect(status().isCreated());

            String body = mockMvc.perform(get(LINKS).header("Authorization", bearer(token)))
                    .andReturn().getResponse().getContentAsString();

            // A link response carries the link only. No nested user object, and
            // in particular no password field.
            assertThat(body).doesNotContain("password");
            assertThat(body).doesNotContain("\"user\"");
            assertThat(body).doesNotContain("@example.test");
        }
    }
}
