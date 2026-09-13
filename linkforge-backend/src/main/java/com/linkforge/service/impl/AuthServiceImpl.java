package com.linkforge.service.impl;

import com.linkforge.dto.request.LoginRequest;
import com.linkforge.dto.request.RegisterRequest;
import com.linkforge.dto.response.AuthResponse;
import com.linkforge.entity.Role;
import com.linkforge.entity.User;
import com.linkforge.exception.DuplicateResourceException;
import com.linkforge.repository.UserRepository;
import com.linkforge.security.jwt.JwtService;
import com.linkforge.security.service.CustomUserDetails;
import com.linkforge.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Registration and login.
 *
 * Failures are raised as typed exceptions so
 * {@link com.linkforge.exception.GlobalExceptionHandler} can map each to the
 * right status and message. The previous version threw bare
 * {@code RuntimeException}, which fell through to a generic 500 and — because
 * Spring Security intercepted it first — reached the client as an empty-bodied
 * 403 with no explanation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    /**
     * Creates an account and signs the new user in.
     *
     * Registering returns a token rather than requiring a second round trip
     * through {@code /login}; the transaction commits before the token is
     * issued, so a token is never handed out for a user that was not persisted.
     */
    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUsername().trim();

        // Checked up front so the response can name the offending field. The
        // catch below is still needed: two simultaneous registrations can both
        // pass this check before either inserts.
        if (userRepository.existsByEmail(email)) {
            throw DuplicateResourceException.email(email);
        }

        if (userRepository.existsByUsername(username)) {
            throw DuplicateResourceException.username(username);
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(true)
                .build();

        try {
            userRepository.saveAndFlush(user);

        } catch (DataIntegrityViolationException ex) {
            // A concurrent registration won the race. The database constraint is
            // the real guarantee, so translate its failure into the same
            // conflict the up-front check would have produced. Which field
            // collided is not reliably recoverable from the driver's message, so
            // a generic conflict is returned rather than guessing wrong.
            log.debug("Registration conflicted with a concurrent insert for email {}", email);
            throw new DuplicateResourceException(
                    "An account with those details already exists",
                    Map.of());
        }

        log.info("Registered user {}", user.getId());

        return AuthResponse.builder()
                .token(jwtService.generateToken(new CustomUserDetails(user)))
                .build();
    }

    /**
     * Verifies credentials and issues a token.
     *
     * An unknown email and a wrong password produce the identical exception, and
     * the same response is returned after the same amount of work. Returning a
     * distinct "no such user" would turn this endpoint into a way to test which
     * addresses have accounts.
     *
     * {@link BadCredentialsException} is intentional rather than a custom type:
     * it is the exception Spring Security already treats as "authentication
     * failed", and the global handler maps it to a generic 401.
     */
    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.debug("Failed login attempt for existing account {}", user.getId());
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            // Deliberately the same generic failure: telling a caller that the
            // account exists but is disabled leaks that the address is
            // registered.
            log.debug("Rejected login for disabled account {}", user.getId());
            throw new BadCredentialsException("Invalid email or password");
        }

        return AuthResponse.builder()
                .token(jwtService.generateToken(new CustomUserDetails(user)))
                .build();
    }
}
