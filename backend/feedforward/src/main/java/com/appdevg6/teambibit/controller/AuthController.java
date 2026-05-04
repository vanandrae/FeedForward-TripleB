package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.dto.LoginRequest;
import com.appdevg6.teambibit.dto.RegisterRequest;
import com.appdevg6.teambibit.dto.AuthResponse;
import com.appdevg6.teambibit.dto.MessageResponse;
import com.appdevg6.teambibit.entity.UserEntity;
import com.appdevg6.teambibit.repository.UserRepository;
import com.appdevg6.teambibit.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Login attempt for email: {}", loginRequest.getEmail());
            
            // Check if user exists and is banned BEFORE authentication
            Optional<UserEntity> userOpt = userRepository.findByEmail(loginRequest.getEmail());
            if (userOpt.isPresent() && userOpt.get().isBanned()) {
                logger.warn("Banned user attempted to login: {}", loginRequest.getEmail());
                return ResponseEntity.status(403).body(new MessageResponse("Your account has been banned. Please contact an administrator."));
            }
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateToken(loginRequest.getEmail());
            
            UserEntity user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            logger.info("Login successful for: {}", loginRequest.getEmail());
            
            AuthResponse response = new AuthResponse(jwt, user.getUserId(), user.getFullName(), user.getEmail(), user.getRole());
            response.setBanned(user.isBanned()); // Send banned status to frontend
            
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            logger.error("Authentication failed for {}: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(401).body(new MessageResponse("Invalid email or password"));
        } catch (Exception e) {
            logger.error("Login error: ", e);
            return ResponseEntity.status(500).body(new MessageResponse("Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            logger.info("Registration attempt for email: {}", registerRequest.getEmail());
            
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already taken!"));
            }

            // Create new user - always set role to student
            UserEntity user = new UserEntity();
            user.setFullName(registerRequest.getName());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setRole("student"); // Force student role
            user.setDepartment(registerRequest.getDepartment());
            user.setBanned(false); // New users are not banned
            
            userRepository.save(user);
            
            logger.info("Registration successful for: {}", registerRequest.getEmail());

            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            logger.error("Registration error: ", e);
            return ResponseEntity.status(500).body(new MessageResponse("Registration failed: " + e.getMessage()));
        }
    }
}