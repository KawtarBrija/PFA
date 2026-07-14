package com.somaport.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "movements")
@Getter
@Setter
@NoArgsConstructor
public class Movement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_id")
    private Container container;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType movementType;

    @Column(nullable = false)
    private LocalDateTime dateHeure;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User utilisateurConnecte;

    @Column(nullable = false)
    private String allocationCode;

    @Column(nullable = true)
    private String remarque;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContainerState etat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContainerType typeIso;

    private String bloc;
    private String ligne;
    private String places;
}

