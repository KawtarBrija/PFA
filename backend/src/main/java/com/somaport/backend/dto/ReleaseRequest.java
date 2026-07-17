package com.somaport.backend.dto;

import com.somaport.backend.domain.ContainerState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReleaseRequest {
    @NotBlank
    private String registrationNumber;

    @NotNull
    private ContainerState exitState;
}
