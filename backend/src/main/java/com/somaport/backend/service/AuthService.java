package com.somaport.backend.service;

import com.somaport.backend.domain.Role;
import com.somaport.backend.domain.RoleName;
import com.somaport.backend.domain.User;
import com.somaport.backend.dto.AuthLoginRequest;
import com.somaport.backend.dto.AuthResponse;
import com.somaport.backend.dto.RegisterRequest;
import com.somaport.backend.dto.UserResponse;
import com.somaport.backend.exception.BadRequestException;
import com.somaport.backend.exception.ConflictException;
import com.somaport.backend.mapper.UserMapper;
import com.somaport.backend.repository.RoleRepository;
import com.somaport.backend.repository.UserRepository;
import com.somaport.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use");
        }
        Role role = roleRepository.findByName(request.getRoleName() == null ? RoleName.AGENT : request.getRoleName())
            .orElseThrow(() -> new BadRequestException("Role not found"));

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        userRepository.save(user);
        log.info("Registered new user {}", user.getEmail());
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, "Bearer", userMapper.toResponse(user));
    }

    public AuthResponse login(AuthLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, "Bearer", userMapper.toResponse(user));
    }

    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("User not authenticated");
        }
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new BadRequestException("User not found"));
        return userMapper.toResponse(user);
    }
}
