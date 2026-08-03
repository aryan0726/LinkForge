package com.linkforge.dto.link;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateLinkRequest {

    @NotBlank(message = "Original URL is required")
    private String originalUrl;
}