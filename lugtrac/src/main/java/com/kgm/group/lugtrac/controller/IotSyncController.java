package com.kgm.group.lugtrac.controller;

import com.kgm.group.lugtrac.dto.IotSyncPayload;
import com.kgm.group.lugtrac.model.Baggage;
import com.kgm.group.lugtrac.model.Alert;
import com.kgm.group.lugtrac.repository.BaggageRepository;
import com.kgm.group.lugtrac.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IotSyncController {

    private final BaggageRepository baggageRepository;
    private final AlertRepository alertRepository;

    @PostMapping("/sync")
    public ResponseEntity<?> syncHardware(@RequestBody IotSyncPayload payload) {
        Optional<Baggage> baggageOpt = baggageRepository.findByRfidUid(payload.getRfidUid());

        if (baggageOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Baggage with RFID " + payload.getRfidUid() + " not found.");
        }

        Baggage bag = baggageOpt.get();

        // 1. Update the live weight from the ESP32 Load Cell
        bag.setWeight(payload.getWeight());

        // 2. Hardware Security Logic (Tamper Detection)
        // If reed switch is open (false) AND the bag is supposed to be locked (true)
        if (!payload.isReedSwitchClosed() && bag.isLocked()) {

            // Set the boolean flag on the bag
            bag.setTamperAlert(true);

            // Generate the permanent Audit Trail record in the Alerts table
            Alert alert = new Alert();
            alert.setAlertType("TAMPER_BREACH");
            alert.setMessage("Security breach: Zipper magnets separated while Smart Lock was ARMED!");
            alert.setTimestamp(LocalDateTime.now());
            alert.setResolved(false);
            alert.setBaggage(bag);

            alertRepository.save(alert);
        }

        baggageRepository.save(bag);

        return ResponseEntity.ok("Hardware sync successful for bag: " + bag.getPnr());
    }
}