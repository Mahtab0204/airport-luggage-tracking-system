package com.kgm.group.lugtrac.controller;

import com.kgm.group.lugtrac.model.Baggage;
import com.kgm.group.lugtrac.model.User;
import com.kgm.group.lugtrac.repository.BaggageRepository;
import com.kgm.group.lugtrac.repository.UserRepository;
import com.kgm.group.lugtrac.request.BaggageRequest;
import com.kgm.group.lugtrac.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/baggage")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BaggageController {

    private final BaggageRepository baggageRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @PostMapping("/register")
    public ResponseEntity<?> registerBaggage(@RequestBody BaggageRequest request, Authentication authentication) {

        String userEmail = authentication.getName();

        User passenger = (User) userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (baggageRepository.findByRfidUid(request.getRfidUid()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("RFID Tag is already registered to a bag.");
        }

        Baggage baggage = new Baggage();
        baggage.setPnr(request.getPnr());
        baggage.setRfidUid(request.getRfidUid());
        baggage.setMediaUrls(request.getMediaUrls());
        baggage.setCurrentStatus("PRE_FLIGHT");
        baggage.setCurrentCheckpoint("Passenger Device");
        baggage.setPassenger(passenger);

        baggageRepository.save(baggage);

        return ResponseEntity.ok("Baggage linked successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBaggageById(@PathVariable Long id) {
        Optional<Baggage> optionalBaggage = baggageRepository.findById(id);

        if (optionalBaggage.isPresent()) {
            return ResponseEntity.ok(optionalBaggage.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Baggage not found.");
    }

    @GetMapping("/my-bags")
    public ResponseEntity<?> getMyBaggage(Authentication authentication) {
        String userEmail = authentication.getName();
        User passenger = (User) userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Baggage> myBags = baggageRepository.findByPassenger(passenger);

        return ResponseEntity.ok(myBags);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBaggage(@PathVariable Long id, @RequestBody Baggage updateDetails) {
        Optional<Baggage> optionalBaggage = baggageRepository.findById(id);

        if (optionalBaggage.isPresent()) {
            Baggage bag = optionalBaggage.get();
            bag.setPnr(updateDetails.getPnr());
            bag.setRfidUid(updateDetails.getRfidUid());

            if (updateDetails.getMediaUrls() != null) {
                List<String> oldUrls = bag.getMediaUrls();
                List<String> newUrls = updateDetails.getMediaUrls();

                for (String oldUrl : oldUrls) {
                    if (!newUrls.contains(oldUrl)) {
                        cloudinaryService.deleteMediaFromUrl(oldUrl);
                    }
                }

                bag.getMediaUrls().clear();
                bag.getMediaUrls().addAll(newUrls);
            }

            baggageRepository.save(bag);
            return ResponseEntity.ok(bag);
        }
        return ResponseEntity.badRequest().body("Baggage not found.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBaggage(@PathVariable Long id) {
        Optional<Baggage> optionalBaggage = baggageRepository.findById(id);

        if (optionalBaggage.isPresent()) {
            Baggage bag = optionalBaggage.get();

            if (bag.getMediaUrls() != null && !bag.getMediaUrls().isEmpty()) {
                for (String url : bag.getMediaUrls()) {
                    cloudinaryService.deleteMediaFromUrl(url);
                }
            }

            baggageRepository.delete(bag);
            return ResponseEntity.ok("Baggage and all associated cloud media deleted successfully.");
        }
        return ResponseEntity.badRequest().body("Baggage not found.");
    }

    @PutMapping("/{id}/toggle-lock")
    public ResponseEntity<?> toggleLock(@PathVariable Long id) {
        Optional<Baggage> optionalBaggage = baggageRepository.findById(id);

        if (optionalBaggage.isPresent()) {
            Baggage bag = optionalBaggage.get();

            bag.setLocked(!bag.isLocked());

            baggageRepository.save(bag);
            return ResponseEntity.ok(bag);
        }
        return ResponseEntity.badRequest().body("Baggage not found.");
    }
}