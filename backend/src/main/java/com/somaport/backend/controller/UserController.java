package com.somaport.backend.controller;

import com.somaport.backend.domain.User;
import com.somaport.backend.dto.ChangePasswordRequest;
import com.somaport.backend.dto.RegisterRequest;
import com.somaport.backend.dto.ResetPasswordRequest;
import com.somaport.backend.dto.UpdateProfileRequest;
import com.somaport.backend.dto.UpdateUserRequest;
import com.somaport.backend.dto.UserResponse;
import com.somaport.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody RegisterRequest request,
                                                     @AuthenticationPrincipal User currentUser,
                                                     HttpServletRequest httpRequest) {
        return ResponseEntity.ok(userService.createUser(request, currentUser, httpRequest));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> listUsers(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) com.somaport.backend.domain.RoleName role
    ) {
        if (query == null && role == null) {
            return ResponseEntity.ok(userService.listUsers());
        }
        return ResponseEntity.ok(userService.searchUsers(query, role));
    }


    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query, null));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateOwnProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                          @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.updateOwnProfile(currentUser, request));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<Void> changeOwnPassword(@Valid @RequestBody ChangePasswordRequest request,
                                                   @AuthenticationPrincipal User currentUser) {
        userService.changeOwnPassword(currentUser, request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request,
                                                     @AuthenticationPrincipal User currentUser,
                                                     HttpServletRequest httpRequest) {
        return ResponseEntity.ok(userService.updateUser(id, request, currentUser, httpRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id,
                                            @AuthenticationPrincipal User currentUser,
                                            HttpServletRequest httpRequest) {
        userService.deleteUser(id, currentUser, httpRequest);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordRequest request,
                                               @AuthenticationPrincipal User currentUser,
                                               HttpServletRequest httpRequest) {
        userService.resetPassword(id, request, currentUser, httpRequest);
        return ResponseEntity.noContent().build();
    }
}
