package com.somaport.backend.repository;

import com.somaport.backend.domain.Role;
import com.somaport.backend.domain.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
