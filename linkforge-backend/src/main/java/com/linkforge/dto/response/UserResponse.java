package com.linkforge.dto.response;

import com.linkforge.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Public representation of a user.
 *
 * This type exists specifically so a JPA entity is never serialised to a
 * client. Returning {@link User} directly previously exposed the BCrypt
 * password hash — and {@code User} is a JPA entity, so serialising it couples
 * the API contract to the database mapping and risks leaking any column added
 * later.
 *
 * Every field here is deliberately chosen. Nothing is copied automatically.
 */
@Getter
@Builder
public class UserResponse {

    private final UUID id;

    private final String fullName;

    private final String username;

    private final String email;

    /** USER or ADMIN. Safe to expose: the client uses it for UI decisions only. */
    private final String role;

    private final boolean enabled;

    private final LocalDateTime createdAt;

    /**
     * Maps an entity to its public form.
     *
     * Note the absent fields: {@code password}, {@code updatedAt} and the JPA
     * internals are intentionally dropped. If a field is not named here, it is
     * not sent.
     */
    public static UserResponse from(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
