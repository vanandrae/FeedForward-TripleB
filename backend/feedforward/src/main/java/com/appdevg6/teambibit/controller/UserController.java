package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.entity.FeedbackEntity;
import com.appdevg6.teambibit.entity.UserEntity;
import com.appdevg6.teambibit.service.FeedbackService;
import com.appdevg6.teambibit.service.UserService;
import com.appdevg6.teambibit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;
    private final FeedbackService feedbackService;
    
    @Autowired
    private UserRepository userRepository;

    public UserController(UserService userService, FeedbackService feedbackService) {
        this.userService = userService;
        this.feedbackService = feedbackService;
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfileByEmail(authentication.getName()));
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateProfile(Authentication authentication,
                                                             @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(userService.updateProfileByEmail(authentication.getName(), payload));
    }
    
    // NEW: Update profile picture with better error handling
    @PutMapping("/profile-picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfilePicture(Authentication authentication,
                                                   @RequestBody Map<String, String> payload) {
        try {
            String email = authentication.getName();
            String profilePicture = payload.get("profilePicture");
            
            System.out.println("========================================");
            System.out.println("Updating profile picture for: " + email);
            System.out.println("Image data length: " + (profilePicture != null ? profilePicture.length() : 0));
            System.out.println("Has data: " + (profilePicture != null && profilePicture.length() > 100));
            
            if (profilePicture == null || profilePicture.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No image data provided"));
            }
            
            Optional<UserEntity> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            
            UserEntity user = userOpt.get();
            user.setProfilePicture(profilePicture);
            userRepository.save(user);
            
            System.out.println("Profile picture saved successfully for: " + email);
            System.out.println("========================================");
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile picture updated successfully");
            response.put("profilePicture", profilePicture);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error updating profile picture: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update profile picture: " + e.getMessage()));
        }
    }

    @GetMapping("/feedback")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FeedbackEntity>> getUserFeedback(Authentication authentication) {
        return ResponseEntity.ok(feedbackService.getFeedbackByAuthorEmail(authentication.getName()));
    }

    @GetMapping("/by-email")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserByEmail(@RequestParam String email) {
        Optional<UserEntity> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("fullName", user.get().getFullName());
            response.put("name", user.get().getFullName());
            response.put("email", user.get().getEmail());
            response.put("role", user.get().getRole());
            response.put("profilePicture", user.get().getProfilePicture());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }
}