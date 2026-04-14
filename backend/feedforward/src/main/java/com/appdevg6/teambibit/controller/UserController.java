package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.entity.FeedbackEntity;
import com.appdevg6.teambibit.service.FeedbackService;
import com.appdevg6.teambibit.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;
    private final FeedbackService feedbackService;

    public UserController(UserService userService, FeedbackService feedbackService) {
        this.userService = userService;
        this.feedbackService = feedbackService;
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfileByEmail(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(Authentication authentication,
                                                             @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(userService.updateProfileByEmail(authentication.getName(), payload));
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<FeedbackEntity>> getUserFeedback(Authentication authentication) {
        return ResponseEntity.ok(feedbackService.getFeedbackByAuthorEmail(authentication.getName()));
    }
}