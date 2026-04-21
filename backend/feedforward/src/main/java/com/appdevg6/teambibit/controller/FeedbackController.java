package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.entity.FeedbackEntity;
import com.appdevg6.teambibit.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:3000")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackEntity>> getAllFeedback() {
        return ResponseEntity.ok(feedbackRepository.findAll());
    }

    @GetMapping("/user")
    public ResponseEntity<List<FeedbackEntity>> getUserFeedback(Authentication auth) {
        return ResponseEntity.ok(feedbackRepository.findByAuthorEmail(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackEntity> getFeedbackById(@PathVariable Long id) {
        return feedbackRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FeedbackEntity> createFeedback(@RequestBody FeedbackEntity feedback, Authentication auth) {
        feedback.setFeedbackId(null);
        feedback.setAuthorEmail(auth.getName());
        feedback.setStatus(feedback.getStatus() == null ? "PENDING" : feedback.getStatus());
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(feedbackRepository.save(feedback));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeedbackEntity> updateFeedback(@PathVariable Long id, @RequestBody FeedbackEntity updatedFeedback, Authentication auth) {
        return feedbackRepository.findById(id)
                .filter(f -> f.getAuthorEmail().equals(auth.getName()) || auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
                .map(existing -> {
                    existing.setTitle(updatedFeedback.getTitle());
                    existing.setDescription(updatedFeedback.getDescription());
                    existing.setCategory(updatedFeedback.getCategory());
                    existing.setPriority(updatedFeedback.getPriority());
                    existing.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(feedbackRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<FeedbackEntity> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return feedbackRepository.findById(id)
                .map(existing -> {
                    existing.setStatus(payload.get("status"));
                    existing.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(feedbackRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        if (feedbackRepository.existsById(id)) {
            feedbackRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}