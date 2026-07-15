package com.somaport.backend.service;

import com.somaport.backend.domain.*;
import com.somaport.backend.repository.BlockRepository;
import com.somaport.backend.repository.LineRepository;
import com.somaport.backend.repository.PlaceRepository;
import com.somaport.backend.repository.RoleRepository;
import com.somaport.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;

@Component
@RequiredArgsConstructor
public class DataSeeder {

    private static final String ADMIN_EMAIL = "admin@somaport.com";
    private static final String LEGACY_ADMIN_EMAIL = "admin@sommaport.com";
    private static final String ADMIN_PASSWORD = "admin123";

    private static final String SUPERVISEUR_EMAIL = "superviseur@somaport.com";
    private static final String LEGACY_SUPERVISEUR_EMAIL = "superviseur@sommaport.com";
    private static final String SUPERVISEUR_PASSWORD = "super123";

    private static final String AGENT_EMAIL = "agent@somaport.com";
    private static final String LEGACY_AGENT_EMAIL = "agent@sommaport.com";
    private static final String AGENT_PASSWORD = "agent123";


    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BlockRepository blockRepository;
    private final LineRepository lineRepository;
    private final PlaceRepository placeRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        seedRoles();
        upsertDefaultUsers();
        seedPark();
    }


    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            roleRepository.findByName(roleName).orElseGet(() -> {
                Role role = new Role();
                role.setName(roleName);
                role.setDescription(roleName.name());
                return roleRepository.save(role);
            });
        }
    }

    private void upsertDefaultUsers() {
        upsertUser(ADMIN_EMAIL, ADMIN_PASSWORD, RoleName.ADMIN, "Admin", "SomaPort", "+212600000000", LEGACY_ADMIN_EMAIL);
        upsertUser(SUPERVISEUR_EMAIL, SUPERVISEUR_PASSWORD, RoleName.SUPERVISOR, "Superviseur", "SomaPort", "+212600000001", LEGACY_SUPERVISEUR_EMAIL);
        upsertUser(AGENT_EMAIL, AGENT_PASSWORD, RoleName.AGENT, "Agent", "SomaPort", "+212600000002", LEGACY_AGENT_EMAIL);
    }

    private void upsertUser(
        String email,
        String rawPassword,
        RoleName roleName,
        String firstName,
        String lastName,
        String phone,
        String legacyEmail
    ) {
        Role role = roleRepository.findByName(roleName).orElseThrow();

        java.util.Optional<User> existing = userRepository.findByEmail(email)
            .or(() -> (legacyEmail != null ? userRepository.findByEmail(legacyEmail) : java.util.Optional.empty()));

        // Ne pas recréer/écraser les comptes si l’utilisateur existe déjà en base.
        // (Ceci garantit que le compte admin reste stable entre exécutions et évite de demander une ré-initialisation.)
        if (existing.isPresent()) {
            User user = existing.get();
            // On met à jour seulement les informations non sensibles.
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setPhone(phone);
            user.setRole(role);
            userRepository.save(user);
            return;
        }

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        userRepository.save(user);
    }


    private void seedPark() {
        if (blockRepository.count() > 0) {
            return;
        }
        String[] blockNames = {"A", "B"};
        for (String blockName : blockNames) {
            Block block = new Block();
            block.setName(blockName);
            block.setDescription("Bloc " + blockName);
            block = blockRepository.save(block);
            for (int lineNumber = 1; lineNumber <= 4; lineNumber++) {
                Line line = new Line();
                line.setName(String.format("%02d", lineNumber));
                line.setBlock(block);
                line = lineRepository.save(line);
                for (int placeNumber = 1; placeNumber <= 20; placeNumber++) {
                    Place place = new Place();
                    place.setLine(line);
                    place.setNumber(placeNumber);
                    place.setState(PlaceState.FREE);
                    placeRepository.save(place);
                }
            }
        }
    }
}
