package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.entity.FeedbackEntity;
import com.appdevg6.teambibit.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping
    public ResponseEntity<List<FeedbackEntity>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackEntity> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }

    @PostMapping
    public ResponseEntity<FeedbackEntity> createFeedback(@RequestBody FeedbackEntity feedback, Authentication authentication) {
        return ResponseEntity.ok(feedbackService.createFeedback(feedback, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeedbackEntity> updateFeedback(@PathVariable Long id,
                                                         @RequestBody FeedbackEntity feedback,
                                                         Authentication authentication) {
        return ResponseEntity.ok(feedbackService.updateFeedback(id, feedback, authentication.getName()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<FeedbackEntity> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(feedbackService.updateFeedbackStatus(id, payload.getOrDefault("status", "PENDING")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id, Authentication authentication) {
        feedbackService.deleteFeedback(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}