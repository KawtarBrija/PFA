package com.somaport.backend.service;

import com.somaport.backend.domain.Role;
import com.somaport.backend.domain.RoleName;
import com.somaport.backend.domain.User;
import com.somaport.backend.dto.RegisterRequest;
import com.somaport.backend.dto.UserResponse;
import com.somaport.backend.exception.BadRequestException;
import com.somaport.backend.exception.ConflictException;
import com.somaport.backend.exception.ResourceNotFoundException;
import com.somaport.backend.mapper.UserMapper;
import com.somaport.backend.repository.RoleRepository;
import com.somaport.backend.repository.UserRepository;
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

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(userMapper::toResponse).toList();
    }

    @Transactional
    public UserResponse createUser(RegisterRequest request) {
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
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(Long id, RegisterRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        if (request.getRoleName() != null) {
            Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new BadRequestException("Role not found"));
            user.setRole(role);
        }
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    public List<UserResponse> searchUsers(String query) {
        return userRepository.findAll().stream()
            .filter(user -> user.getFirstName().toLowerCase().contains(query.toLowerCase())
                || user.getLastName().toLowerCase().contains(query.toLowerCase())
                || user.getEmail().toLowerCase().contains(query.toLowerCase()))
            .map(userMapper::toResponse).toList();
    }
}
