package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.entity.NotificationEntity;
import com.appdevg6.teambibit.entity.UserEntity;
import com.appdevg6.teambibit.repository.NotificationRepository;
import com.appdevg6.teambibit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<UserEntity> user = userRepository.findById(id);
        if (user.isPresent()) {
            user.get().setRole(payload.get("role"));
            userRepository.save(user.get());
            return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
    }
    
    @PutMapping("/users/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> banUser(@PathVariable Long id) {
        Optional<UserEntity> user = userRepository.findById(id);
        if (user.isPresent()) {
            user.get().setBanned(true);
            userRepository.save(user.get());
            return ResponseEntity.ok(Map.of("message", "User banned successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
    }
    
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<UserEntity> user = userRepository.findById(id);
        if (user.isPresent()) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
    }
}