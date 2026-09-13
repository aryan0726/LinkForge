package com.linkforge.controller;

import com.linkforge.dto.response.UserResponse;
import com.linkforge.entity.User;
import com.linkforge.exception.ResourceNotFoundException;
import com.linkforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * The authenticated user's own profile.
     *
     * Returns {@link UserResponse}, never the {@link User} entity. Serialising
     * the entity previously sent the BCrypt password hash to the client, and
     * would have leaked any column added to the table later. The mapping is
     * explicit so a new entity field cannot become part of the API by accident.
     *
     * The identity is taken from the SecurityContext — populated by the JWT
     * filter — rather than from a request parameter, so a caller cannot ask for
     * someone else's profile.
     */
    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(ResourceNotFoundException::user);

        return UserResponse.from(user);
    }
}
