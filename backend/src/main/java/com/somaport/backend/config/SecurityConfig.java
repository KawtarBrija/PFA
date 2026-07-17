package com.somaport.backend.config;

import com.somaport.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/refresh", "/swagger-ui/**", "/v3/api-docs/**", "/actuator/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register").hasRole("ADMIN")

                // Conteneurs : consultation réservée à SUPERVISOR (Container Inventory) et AGENT (recherche pour Release).
                // ADMIN n'a plus aucun accès aux conteneurs (menu = User Management + History uniquement).
                .requestMatchers(HttpMethod.GET, "/api/containers/**").hasAnyRole("SUPERVISOR", "AGENT")
                // Enregistrement d'arrivée : uniquement AGENT.
                .requestMatchers(HttpMethod.POST, "/api/containers/**").hasRole("AGENT")

                // Sorties de conteneurs : AGENT effectue la sortie, ADMIN/SUPERVISOR consultent en lecture seule.
                .requestMatchers(HttpMethod.POST, "/api/releases/**").hasRole("AGENT")
                .requestMatchers(HttpMethod.GET, "/api/releases/**").hasAnyRole("AGENT", "SUPERVISOR", "ADMIN")

                // Profil personnel : tout utilisateur authentifié peut consulter/modifier ses propres informations.
                .requestMatchers(HttpMethod.PUT, "/api/users/me").hasAnyRole("AGENT", "SUPERVISOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/users/me/change-password").hasAnyRole("AGENT", "SUPERVISOR", "ADMIN")

                // Utilisateurs : réservé à ADMIN (User Management).
                .requestMatchers(HttpMethod.GET, "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")

                // Mouvements : consultation réservée à SUPERVISOR (menu Movements).
                .requestMatchers(HttpMethod.GET, "/api/movements/**").hasRole("SUPERVISOR")

                // Historique : ADMIN et SUPERVISOR consultent tout, AGENT ne voit que ses propres opérations.
                .requestMatchers(HttpMethod.GET, "/api/histories/**").hasAnyRole("ADMIN", "SUPERVISOR", "AGENT")

                // Journal d'audit / sécurité : réservé à ADMIN.
                .requestMatchers(HttpMethod.GET, "/api/audit-logs/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(org.springframework.security.core.userdetails.UserDetailsService userDetailsService) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(provider);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
