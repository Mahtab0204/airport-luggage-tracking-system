package com.kgm.group.lugtrac.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "baggage")
public class Baggage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rfidUid;
    private String pnr;
    private String currentStatus;
    private String currentCheckpoint;
    @ElementCollection
    @CollectionTable(name = "baggage_media", joinColumns = @JoinColumn(name = "baggage_id"))
    @Column(name = "media_url")
    private List<String> mediaUrls = new ArrayList<>();
    private String mediaType;
    private boolean isLocked = true;
    private boolean tamperAlert = false;
    private Double weight;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User passenger;

    @OneToMany(mappedBy = "baggage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrackingLog> trackingLogs = new ArrayList<>();

    @OneToMany(mappedBy = "baggage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alert> alerts = new ArrayList<>();
}