package com.kgm.group.lugtrac.controller;

import com.kgm.group.lugtrac.model.Alert;
import com.kgm.group.lugtrac.model.Baggage;
import com.kgm.group.lugtrac.repository.AlertRepository;
import com.kgm.group.lugtrac.repository.BaggageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlertController {

    private final AlertRepository alertRepository;
    private final BaggageRepository baggageRepository;

    /**
     * 1. Fetch Active Alerts
     * Called by the React Dashboard to display the red alert banner and incident logs.
     */
    @GetMapping("/baggage/{bagId}")
    public ResponseEntity<List<Alert>> getAlertsForBag(@PathVariable Long bagId) {

        List<Alert> allAlerts = alertRepository.findByBaggageId(bagId);

        List<Alert> activeAlerts = allAlerts.stream()
                .filter(alert -> !alert.isResolved())
                .collect(Collectors.toList());

        return ResponseEntity.ok(activeAlerts);
    }

    @PutMapping("/{alertId}/resolve")
    public ResponseEntity<?> resolveAlert(@PathVariable Long alertId) {
        Optional<Alert> alertOpt = alertRepository.findById(alertId);

        if (alertOpt.isPresent()) {
            Alert alert = alertOpt.get();

            alert.setResolved(true);
            alertRepository.save(alert);

            Baggage bag = alert.getBaggage();

            boolean hasOtherActiveAlerts = alertRepository.findByBaggageId(bag.getId()).stream()
                    .anyMatch(a -> !a.isResolved());

            if (!hasOtherActiveAlerts) {
                bag.setTamperAlert(false);
                baggageRepository.save(bag);
            }
            return ResponseEntity.ok("Alert successfully resolved.");
        }

        return ResponseEntity.notFound().build();
    }
}