package com.somaport.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
