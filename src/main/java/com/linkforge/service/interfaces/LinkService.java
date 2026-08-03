package com.linkforge.service.interfaces;

import com.linkforge.dto.link.CreateLinkRequest;
import com.linkforge.dto.link.LinkResponse;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

public interface LinkService {

    LinkResponse createShortLink(CreateLinkRequest request);

    void redirect(
            String shortCode,
            HttpServletResponse response
    ) throws IOException;

    List<LinkResponse> getAllLinks();
}