package com.linkforge.controller;

import com.linkforge.dto.link.CreateLinkRequest;
import com.linkforge.dto.link.LinkResponse;
import com.linkforge.service.interfaces.LinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
}