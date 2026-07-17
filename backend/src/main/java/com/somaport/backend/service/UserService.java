package com.somaport.backend.service;

import com.somaport.backend.domain.AuditEventType;
import com.somaport.backend.domain.Role;
import com.somaport.backend.domain.RoleName;
import com.somaport.backend.domain.User;
import com.somaport.backend.dto.RegisterRequest;
import com.somaport.backend.dto.UpdateUserRequest;
import com.somaport.backend.dto.UserResponse;
import com.somaport.backend.exception.BadRequestException;
import com.somaport.backend.exception.ConflictException;
import com.somaport.backend.exception.ResourceNotFoundException;
import com.somaport.backend.mapper.UserMapper;
import com.somaport.backend.repository.RoleRepository;
import com.somaport.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(userMapper::toResponse).toList();
    }

    @Transactional
    public UserResponse createUser(RegisterRequest request, User actor, HttpServletRequest httpRequest) {
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
        User saved = userRepository.save(user);
        auditLogService.log(AuditEventType.USER_CREATED, actor, saved.getEmail(), httpRequest, null);
        return userMapper.toResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request, User actor, HttpServletRequest httpRequest) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        Role role = roleRepository.findByName(request.getRoleName() == null ? RoleName.AGENT : request.getRoleName())
            .orElseThrow(() -> new BadRequestException("Role not found"));
        user.setRole(role);

        User saved = userRepository.save(user);
        auditLogService.log(AuditEventType.USER_UPDATED, actor, saved.getEmail(), httpRequest, null);
        return userMapper.toResponse(saved);
    }

    @Transactional
    public void deleteUser(Long id, User actor, HttpServletRequest httpRequest) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.deleteById(id);
        auditLogService.log(AuditEventType.USER_DELETED, actor, user.getEmail(), httpRequest, null);
    }

    @Transactional
    public void resetPassword(Long id, com.somaport.backend.dto.ResetPasswordRequest request, User actor, HttpServletRequest httpRequest) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditLogService.log(AuditEventType.PASSWORD_RESET, actor, user.getEmail(), httpRequest, null);
    }

    @Transactional
    public UserResponse updateOwnProfile(User currentUser, com.somaport.backend.dto.UpdateProfileRequest request) {
        User user = userRepository.findById(currentUser.getId()).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    @Transactional
    public void changeOwnPassword(User currentUser, com.somaport.backend.dto.ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        User user = userRepository.findById(currentUser.getId()).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserResponse> searchUsers(String query, RoleName roleName) {
        String q = query == null ? "" : query.toLowerCase();

        return userRepository.findAll().stream()
            .filter(user -> {
                boolean matchesQuery = q.isEmpty()
                    || user.getFirstName().toLowerCase().contains(q)
                    || user.getLastName().toLowerCase().contains(q)
                    || user.getEmail().toLowerCase().contains(q);

                boolean matchesRole = roleName == null || (user.getRole() != null && user.getRole().getName() == roleName);

                return matchesQuery && matchesRole;
            })
            .map(userMapper::toResponse)
            .toList();
    }

}
