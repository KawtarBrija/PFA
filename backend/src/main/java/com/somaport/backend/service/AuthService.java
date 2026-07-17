package com.somaport.backend.service;

import com.somaport.backend.domain.AuditEventType;
import com.somaport.backend.domain.RefreshToken;
import com.somaport.backend.domain.Role;
import com.somaport.backend.domain.RoleName;
import com.somaport.backend.domain.User;
import com.somaport.backend.dto.AuthLoginRequest;
import com.somaport.backend.dto.AuthResponse;
import com.somaport.backend.dto.RefreshTokenRequest;
import com.somaport.backend.dto.RegisterRequest;
import com.somaport.backend.dto.TokenRefreshResponse;
import com.somaport.backend.dto.UserResponse;
import com.somaport.backend.exception.BadRequestException;
import com.somaport.backend.exception.ConflictException;
import com.somaport.backend.mapper.UserMapper;
import com.somaport.backend.repository.RoleRepository;
import com.somaport.backend.repository.UserRepository;
import com.somaport.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

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
    private final RefreshTokenService refreshTokenService;
    private final AuditLogService auditLogService;

    @Value("${app.security.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${app.security.lockout-duration-minutes:15}")
    private long lockoutDurationMinutes;

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
        String accessToken = jwtUtil.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.create(user);
        return new AuthResponse(accessToken, refreshToken.getToken(), "Bearer", userMapper.toResponse(user));
    }

    @Transactional
    public AuthResponse login(AuthLoginRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (LockedException ex) {
            auditLogService.log(AuditEventType.LOGIN_FAILURE, null, request.getEmail(), httpRequest, "Account locked");
            throw new BadRequestException("Account temporarily locked due to repeated failed attempts. Try again later.");
        } catch (BadCredentialsException ex) {
            handleFailedAttempt(request.getEmail(), httpRequest);
            throw new BadRequestException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        auditLogService.log(AuditEventType.LOGIN_SUCCESS, user, user.getEmail(), httpRequest, null);

        String accessToken = jwtUtil.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.create(user);
        return new AuthResponse(accessToken, refreshToken.getToken(), "Bearer", userMapper.toResponse(user));
    }

    private void handleFailedAttempt(String email, HttpServletRequest httpRequest) {
        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= maxFailedAttempts) {
                user.setLockedUntil(LocalDateTime.now().plus(Duration.ofMinutes(lockoutDurationMinutes)));
                userRepository.save(user);
                auditLogService.log(AuditEventType.ACCOUNT_LOCKED, user, email, httpRequest,
                    "Locked after " + user.getFailedLoginAttempts() + " failed attempts");
            } else {
                userRepository.save(user);
                auditLogService.log(AuditEventType.LOGIN_FAILURE, user, email, httpRequest, null);
            }
        }, () -> auditLogService.log(AuditEventType.LOGIN_FAILURE, null, email, httpRequest, "Unknown email"));
    }

    @Transactional
    public TokenRefreshResponse refreshAccessToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verify(request.getRefreshToken());
        User user = refreshToken.getUser();
        refreshTokenService.revoke(refreshToken.getToken());
        RefreshToken newRefreshToken = refreshTokenService.create(user);
        String accessToken = jwtUtil.generateToken(user.getEmail());
        return new TokenRefreshResponse(accessToken, newRefreshToken.getToken(), "Bearer");
    }

    @Transactional
    public void logout(RefreshTokenRequest request, HttpServletRequest httpRequest) {
        RefreshToken refreshToken = refreshTokenService.verify(request.getRefreshToken());
        refreshTokenService.revoke(refreshToken.getToken());
        auditLogService.log(AuditEventType.LOGOUT, refreshToken.getUser(), refreshToken.getUser().getEmail(), httpRequest, null);
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
