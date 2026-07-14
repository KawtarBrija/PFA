package com.somaport.backend.dto;

import com.somaport.backend.domain.RoleName;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private RoleName roleName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
