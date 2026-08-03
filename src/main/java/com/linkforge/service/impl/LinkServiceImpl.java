package com.linkforge.service.impl;

import com.linkforge.dto.link.CreateLinkRequest;
import com.linkforge.dto.link.LinkResponse;
import com.linkforge.entity.Link;
import com.linkforge.entity.User;
import com.linkforge.repository.LinkRepository;
import com.linkforge.repository.UserRepository;
import com.linkforge.service.interfaces.LinkService;
import com.linkforge.util.ShortCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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
                .orElseThrow();

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
                .shortCode(shortCode)
                .shortUrl("http://localhost:8080/" + shortCode)
                .clickCount(0L)
                .build();
    }
}