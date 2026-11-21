package com.kgm.group.lugtrac.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "alerts")
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Types: TAMPER_BREACH, WEIGHT_DROP, MISROUTED
    private String alertType;
    private String message;
    private boolean isResolved = false;
    private LocalDateTime timestamp;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "baggage_id")
    private Baggage baggage;
}