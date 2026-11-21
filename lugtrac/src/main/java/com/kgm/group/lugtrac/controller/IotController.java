package com.kgm.group.lugtrac.controller;

import com.kgm.group.lugtrac.model.Alert;
import com.kgm.group.lugtrac.model.Baggage;
import com.kgm.group.lugtrac.model.TrackingLog;
import com.kgm.group.lugtrac.repository.AlertRepository;
import com.kgm.group.lugtrac.repository.BaggageRepository;
import com.kgm.group.lugtrac.repository.TrackingLogRepository;
import com.kgm.group.lugtrac.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IotController {

    private final BaggageRepository baggageRepository;
    private final TrackingLogRepository trackingLogRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;
    private final AlertRepository alertRepository;

    @PostMapping("/scan")
    public String handleRfidScan(@RequestBody Map<String, String> payload) {
        String rfidUid = payload.get("rfidUid");
        String checkpoint = payload.get("checkpoint");

        Optional<Baggage> optionalBaggage = baggageRepository.findByRfidUid(rfidUid);

        if (optionalBaggage.isPresent()) {
            Baggage bag = optionalBaggage.get();
            bag.setCurrentCheckpoint(checkpoint);
            bag.setCurrentStatus("IN_TRANSIT");
            baggageRepository.save(bag);

            TrackingLog log = new TrackingLog();
            log.setRfidUid(rfidUid);
            log.setCheckpointName(checkpoint);
            log.setTimestamp(LocalDateTime.now());
            log.setBaggage(bag);
            trackingLogRepository.save(log);

            messagingTemplate.convertAndSend("/topic/tracking/" + bag.getPnr(), bag);

            return "Scan processed and broadcasted";
        }

        return "Baggage not found";
    }

    @PostMapping("/tamper")
    public String handleTamperAlert(@RequestBody Map<String, String> payload) {
        String rfidUid = payload.get("rfidUid");

        Optional<Baggage> optionalBaggage = baggageRepository.findByRfidUid(rfidUid);

        if (optionalBaggage.isPresent()) {
            Baggage bag = optionalBaggage.get();

            if (bag.isLocked()) {
                bag.setTamperAlert(true);
                baggageRepository.save(bag);

                Alert alert = new Alert();
                alert.setAlertType("TAMPER_BREACH");
                alert.setTimestamp(LocalDateTime.now());
                alert.setBaggage(bag);
                alertRepository.save(alert);

                // 2. Send the automated Email
                if (bag.getPassenger() != null && bag.getPassenger().getEmail() != null) {
                    String passengerEmail = bag.getPassenger().getEmail();
                    String subject = "🚨 URGENT: LugTrac Tamper Alert - PNR: " + bag.getPnr();
                    String body = "Dear Passenger,\n\n" +
                            "A security breach has been detected on your luggage (PNR: " + bag.getPnr() + "). " +
                            "The smart lock was opened unexpectedly while ARMED.\n\n" +
                            "Please contact airport security immediately.\n\n" +
                            "- LugTrac Automated System";

                    emailService.sendAlertEmail(passengerEmail, subject, body);
                }

                TrackingLog log = new TrackingLog();
                log.setRfidUid(rfidUid);
                log.setCheckpointName("⚠️ TAMPER ALERT DETECTED");
                log.setTimestamp(LocalDateTime.now());
                log.setBaggage(bag);
                trackingLogRepository.save(log);

                messagingTemplate.convertAndSend("/topic/tracking/" + bag.getPnr(), bag);

                return "Tamper alert triggered and broadcasted!";
            } else {
                return "Bag opened by passenger. Lock is currently DISARMED. No alert triggered.";
            }
        }

        return "Baggage not found";
    }
}
