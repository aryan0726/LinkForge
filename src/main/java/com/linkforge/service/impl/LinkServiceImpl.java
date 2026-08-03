package com.linkforge.service.impl;

import com.linkforge.dto.link.CreateLinkRequest;
import com.linkforge.dto.link.LinkResponse;
import com.linkforge.entity.Link;
import com.linkforge.entity.User;
import com.linkforge.repository.LinkRepository;
import com.linkforge.repository.UserRepository;
import com.linkforge.service.interfaces.LinkService;
import com.linkforge.util.ShortCodeGenerator;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class LinkServiceImpl implements LinkService {

    private final LinkRepository linkRepository;
    private final UserRepository userRepository;

    @Override
    public LinkResponse createShortLink(CreateLinkRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String shortCode;

        do {
            shortCode = ShortCodeGenerator.generate(6);
        } while (linkRepository.findByShortCode(shortCode).isPresent());

        Link link = Link.builder()
                .originalUrl(request.getOriginalUrl())
                .shortCode(shortCode)
                .clickCount(0L)
                .active(true)
                .user(user)
                .build();

        linkRepository.save(link);

        return LinkResponse.builder()
                .originalUrl(link.getOriginalUrl())
                .shortCode(link.getShortCode())
                .shortUrl("http://localhost:8080/" + link.getShortCode())
                .clickCount(link.getClickCount())
                .build();
    }

    @Override
    public void redirect(String shortCode,
                         HttpServletResponse response)
            throws IOException {

        Link link = linkRepository
                .findByShortCodeAndActiveTrue(shortCode)
                .orElseThrow(() -> new RuntimeException("Short URL not found"));

        link.setClickCount(link.getClickCount() + 1);

        linkRepository.save(link);

        response.sendRedirect(link.getOriginalUrl());
    }
}