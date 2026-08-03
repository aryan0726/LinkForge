package com.linkforge.service.interfaces;

import com.linkforge.dto.link.CreateLinkRequest;
import com.linkforge.dto.link.LinkResponse;

public interface LinkService {

    LinkResponse createShortLink(CreateLinkRequest request);
}