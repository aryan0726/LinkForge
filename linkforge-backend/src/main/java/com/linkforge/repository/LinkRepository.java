package com.linkforge.repository;

import com.linkforge.entity.Link;
import com.linkforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LinkRepository extends JpaRepository<Link, UUID> {

    Optional<Link> findByShortCode(String shortCode);

    Optional<Link> findByShortCodeAndActiveTrue(String shortCode);

    /**
     * The caller's own links.
     *
     * Ordered by primary key descending. {@code Link} has no {@code createdAt}
     * column — it does not extend the audited {@code BaseEntity} — so there is
     * no chronological field to sort on, and inventing an ordering the data
     * cannot support would be worse than being explicit about it.
     *
     * The primary key is a random UUID, so this order is stable but *not*
     * chronological: a newly created link does not reliably appear first. The
     * frontend compensates by prepending the link it just created (see
     * {@code useLinks.prependLink}). Adding a real creation timestamp is the
     * correct fix and is noted in the README.
     */
    List<Link> findByUserOrderByIdDesc(User user);

    /**
     * A single link, but only if it belongs to this user.
     *
     * Ownership is part of the query, not a check performed afterwards. A
     * "fetch then compare the owner" pattern works, but it is one forgotten
     * comparison away from a data leak; making the owner a query parameter means
     * a row belonging to somebody else cannot be returned at all. This is the
     * shape to copy for every future user-scoped lookup.
     */
    Optional<Link> findByIdAndUser(UUID id, User user);

    /**
     * Increments the click counter in the database.
     *
     * The previous implementation read the entity, added one in Java, and saved
     * it back:
     *
     * <pre>
     * link.setClickCount(link.getClickCount() + 1);
     * linkRepository.save(link);
     * </pre>
     *
     * Two concurrent redirects both read the same value, both write the same
     * result, and one increment is silently lost. A lost update on a view
     * counter is not catastrophic, but the pattern is the classic one, and it
     * becomes a real defect the moment the counter feeds billing or quotas.
     *
     * {@code click_count = click_count + 1} is evaluated by the database inside
     * a single statement, so concurrent requests queue on the row lock and every
     * increment is applied. No retry loop, no optimistic-lock exception to
     * handle, no application-level synchronisation.
     *
     * {@code clearAutomatically} and {@code flushAutomatically} keep the
     * persistence context honest: the surrounding transaction may hold a stale
     * {@code Link} instance, and a bulk update bypasses it, so the context is
     * flushed before and cleared after to prevent a later read from returning
     * the pre-increment value.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Link l SET l.clickCount = l.clickCount + 1 WHERE l.id = :id")
    int incrementClickCount(@Param("id") UUID id);
}
