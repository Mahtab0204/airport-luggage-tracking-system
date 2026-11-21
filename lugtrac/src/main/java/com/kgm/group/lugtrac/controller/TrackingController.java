package com.kgm.group.lugtrac.controller;

import com.kgm.group.lugtrac.model.Baggage;
import com.kgm.group.lugtrac.model.TrackingLog;
import com.kgm.group.lugtrac.repository.BaggageRepository;
import com.kgm.group.lugtrac.repository.TrackingLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrackingController {

    private final BaggageRepository baggageRepository;
    private final TrackingLogRepository trackingLogRepository;

    @GetMapping("/{pnr}/history")
    public ResponseEntity<?> getTrackingHistory(@PathVariable String pnr) {
        Optional<Baggage> baggageOpt = baggageRepository.findByPnr(pnr);

        if (baggageOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Baggage not found");
        }

        List<TrackingLog> logs = trackingLogRepository.findByBaggageOrderByTimestampDesc(baggageOpt.get());
        return ResponseEntity.ok(logs);
    }
}