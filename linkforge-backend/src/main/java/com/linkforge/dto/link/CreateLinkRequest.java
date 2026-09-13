package com.linkforge.dto.link;

import com.linkforge.validation.ValidHttpUrl;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateLinkRequest {

    @NotBlank(message = "Original URL is required")
    @Size(max = 2048, message = "URL must be 2048 characters or fewer")
    @ValidHttpUrl
    private String originalUrl;
}
