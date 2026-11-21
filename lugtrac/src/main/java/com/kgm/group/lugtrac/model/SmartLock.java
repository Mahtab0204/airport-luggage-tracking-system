package com.kgm.group.lugtrac.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "smart_locks")
public class SmartLock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String macAddress; // The unique hardware ID of the ESP32 lock

    // States: SECURED, AUTHORIZED_OPEN, BREACHED
    private String lockState;

    @OneToOne
    @JoinColumn(name = "baggage_id")
    private Baggage baggage;
}
