package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.entity.FeedbackEntity;
import com.appdevg6.teambibit.entity.CommentEntity;
import com.appdevg6.teambibit.entity.NotificationEntity;
import com.appdevg6.teambibit.repository.FeedbackRepository;
import com.appdevg6.teambibit.repository.CommentRepository;
import com.appdevg6.teambibit.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:3000")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
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
    public ResponseEntity<FeedbackEntity> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        return feedbackRepository.findById(id)
                .map(existing -> {
                    String oldStatus = existing.getStatus();
                    String newStatus = payload.get("status");
                    existing.setStatus(newStatus);
                    existing.setUpdatedAt(LocalDateTime.now());
                    FeedbackEntity updated = feedbackRepository.save(existing);
                    
                    // Send notification to feedback author about status change
                    if (!oldStatus.equals(newStatus)) {
                        NotificationEntity notification = new NotificationEntity();
                        notification.setUserEmail(existing.getAuthorEmail());
                        notification.setTitle("Feedback Status Updated");
                        notification.setMessage("Your feedback \"" + existing.getTitle() + "\" status changed from " + oldStatus + " to " + newStatus);
                        notification.setType("status_change");
                        notification.setRelatedId(id);
                        notification.setCreatedAt(LocalDateTime.now());
                        notificationRepository.save(notification);
                    }
                    
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // ========== COMMENTS ENDPOINTS ==========
    
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentEntity>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentRepository.findByFeedbackIdOrderByCreatedAtDesc(id));
    }
    
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentEntity> addComment(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        return feedbackRepository.findById(id)
                .map(feedback -> {
                    CommentEntity comment = new CommentEntity();
                    comment.setFeedbackId(id);
                    comment.setAuthorEmail(auth.getName());
                    comment.setContent(payload.get("comment"));
                    comment.setCreatedAt(LocalDateTime.now());
                    CommentEntity saved = commentRepository.save(comment);
                    
                    // Send notification to feedback author
                    if (!feedback.getAuthorEmail().equals(auth.getName())) {
                        NotificationEntity notification = new NotificationEntity();
                        notification.setUserEmail(feedback.getAuthorEmail());
                        notification.setTitle("New Comment on Your Feedback");
                        notification.setMessage(auth.getName() + " commented on your feedback: \"" + feedback.getTitle() + "\"");
                        notification.setType("comment");
                        notification.setRelatedId(id);
                        notification.setCreatedAt(LocalDateTime.now());
                        notificationRepository.save(notification);
                    }
                    
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // ========== UPVOTE ENDPOINTS ==========
    
    @PostMapping("/{id}/upvote")
    public ResponseEntity<?> upvoteFeedback(@PathVariable Long id, Authentication auth) {
        return feedbackRepository.findById(id)
                .map(feedback -> {
                    int currentVotes = feedback.getVotes() != null ? feedback.getVotes() : 0;
                    feedback.setVotes(currentVotes + 1);
                    feedbackRepository.save(feedback);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Upvoted successfully");
                    response.put("votes", feedback.getVotes());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}