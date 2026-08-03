package com.linkforge.controller;

import com.linkforge.dto.link.CreateLinkRequest;
import com.linkforge.dto.link.LinkResponse;
import com.linkforge.service.interfaces.LinkService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;   // <-- ADD THIS

@RestController
@RequestMapping("/api/links")
@RequiredArgsConstructor
public class LinkController {

    private final LinkService linkService;

    @PostMapping
    public LinkResponse create(
            @Valid @RequestBody CreateLinkRequest request) {

        return linkService.createShortLink(request);
    }

    @GetMapping("/{shortCode}")
    public void redirect(
            @PathVariable String shortCode,
            HttpServletResponse response)
            throws IOException {

        linkService.redirect(shortCode, response);
    }

    @GetMapping
    public List<LinkResponse> getMyLinks() {
        return linkService.getAllLinks();
    }
}