package com.kgm.group.lugtrac.controller;

import com.kgm.group.lugtrac.model.User;
import com.kgm.group.lugtrac.repository.UserRepository;

import com.kgm.group.lugtrac.request.LoginRequest;
import com.kgm.group.lugtrac.request.RegisterRequest;
import com.kgm.group.lugtrac.request.VerifyRequest;
import com.kgm.group.lugtrac.response.AuthResponse;
import com.kgm.group.lugtrac.security.JwtService;
import com.kgm.group.lugtrac.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        // Encode the password before saving to the database
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.PASSENGER); // Default role for new sign-ups

        // Generate and set the 6-digit verification code
        String code = emailService.generateVerificationCode();
        user.setVerificationCode(code);
        user.setVerified(false);
        userRepository.save(user);

        // Send the code to the user's email
        emailService.sendVerificationEmail(user.getEmail(), code);

        return ResponseEntity.ok("Verification code sent to email");
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyRequest request) {
        User user = (User) userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVerificationCode() != null && user.getVerificationCode().equals(request.getCode())) {
            user.setVerified(true);
            user.setVerificationCode(null); // Clear the code after successful verification
            userRepository.save(user);

            // Generate JWT token upon successful verification
            String jwtToken = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(jwtToken, user.getRole().name()));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid verification code");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = (User) userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (!user.isVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Please verify your email first.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String jwtToken = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(jwtToken, user.getRole().name()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            String token = emailService.generateVerificationCode();
            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);

            String emailBody = "Hello " + user.getName() + ",\n\n"
                    + "We received a request to reset your password for LugTrac.\n"
                    + "Your 6-digit password reset code is: " + token + "\n\n"
                    + "This code will expire in 15 minutes.\n"
                    + "If you did not request this, please ignore this email.";

            emailService.sendAlertEmail(user.getEmail(), "LugTrac - Password Reset Code", emailBody);

            return ResponseEntity.ok().body(Map.of("message", "Reset code sent to email."));
        }

        return ResponseEntity.ok().body(Map.of("message", "If an account exists, a code was sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        Optional<User> userOptional = userRepository.findByResetToken(token);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (user.getResetTokenExpiry() == null || LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reset code has expired. Please request a new one."));
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetToken(null);
            user.setResetTokenExpiry(null); // Clear expiration
            userRepository.save(user);

            return ResponseEntity.ok().body(Map.of("message", "Password successfully reset."));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Invalid reset code."));
    }
}