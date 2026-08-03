package com.linkforge.dto.link;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LinkResponse {

    private String originalUrl;
    private String shortCode;
    private String shortUrl;
    private Long clickCount;
}