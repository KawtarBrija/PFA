package com.somaport.backend.dto;

import com.somaport.backend.domain.ContainerState;
import com.somaport.backend.domain.ContainerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateContainerRequest {
    @NotBlank
    private String registrationNumber;

    @NotNull
    private ContainerState state;

    @NotNull
    private ContainerType type;
}
