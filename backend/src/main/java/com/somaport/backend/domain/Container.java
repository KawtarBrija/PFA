package com.somaport.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "containers", uniqueConstraints = @UniqueConstraint(columnNames = "registrationNumber"))
@Getter
@Setter
@NoArgsConstructor
public class Container {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String registrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContainerState state;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContainerType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "block_id")
    private Block block;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "line_id")
    private Line line;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "container_places",
        joinColumns = @JoinColumn(name = "container_id"),
        inverseJoinColumns = @JoinColumn(name = "place_id")
    )
    private List<Place> places = new ArrayList<>();

    private String allocationCode;

    private LocalDateTime entryDateTime = LocalDateTime.now();

    private LocalDateTime exitDateTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User agent;
}
