package com.linkforge;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Verifies the application context starts at all.
 *
 * This is not a redundant smoke test in this project: the context only starts if
 * the Flyway migrations applied cleanly *and* Hibernate's {@code ddl-auto:
 * validate} found an exact match between the migrations and the entity mappings.
 * A mismatch here fails the build, which is exactly the safety net that makes
 * validate mode worth using over {@code update}.
 */
@SpringBootTest
@ActiveProfiles("test")
class LinkforgeBackendApplicationTests {

	@Test
	void contextLoads() {
	}
}
