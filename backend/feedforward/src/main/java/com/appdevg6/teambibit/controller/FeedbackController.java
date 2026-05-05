package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.entity.FeedbackEntity;
import com.appdevg6.teambibit.entity.CommentEntity;
import com.appdevg6.teambibit.entity.NotificationEntity;
import com.appdevg6.teambibit.entity.UserEntity;
import com.appdevg6.teambibit.repository.FeedbackRepository;
import com.appdevg6.teambibit.repository.CommentRepository;
import com.appdevg6.teambibit.repository.NotificationRepository;
import com.appdevg6.teambibit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

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
    
    @Autowired
    private UserRepository userRepository;

    // DTO class for feedback response with author name and anonymous flag
    public static class FeedbackResponse {
        private Long feedbackId;
        private String title;
        private String description;
        private String category;
        private String status;
        private String priority;
        private String authorName;
        private String authorEmail;
        private boolean anonymous;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer votes;
        private Integer commentCount;
        private boolean userHasUpvoted;

        // Getters and Setters
        public Long getFeedbackId() { return feedbackId; }
        public void setFeedbackId(Long feedbackId) { this.feedbackId = feedbackId; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        
        public String getAuthorEmail() { return authorEmail; }
        public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }
        
        public boolean isAnonymous() { return anonymous; }
        public void setAnonymous(boolean anonymous) { this.anonymous = anonymous; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
        
        public Integer getVotes() { return votes; }
        public void setVotes(Integer votes) { this.votes = votes; }
        
        public Integer getCommentCount() { return commentCount; }
        public void setCommentCount(Integer commentCount) { this.commentCount = commentCount; }
        
        public boolean isUserHasUpvoted() { return userHasUpvoted; }
        public void setUserHasUpvoted(boolean userHasUpvoted) { this.userHasUpvoted = userHasUpvoted; }
    }

    // ALL authenticated users can see all feedback with author names
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback(Authentication auth) {
        List<FeedbackEntity> feedbacks = feedbackRepository.findAll();
        List<FeedbackResponse> result = new ArrayList<>();
        String currentUser = auth.getName();
        
        for (FeedbackEntity feedback : feedbacks) {
            FeedbackResponse response = new FeedbackResponse();
            response.setFeedbackId(feedback.getFeedbackId());
            response.setTitle(feedback.getTitle());
            response.setDescription(feedback.getDescription());
            response.setCategory(feedback.getCategory());
            response.setStatus(feedback.getStatus() != null ? feedback.getStatus().toUpperCase() : "PENDING");
            response.setPriority(feedback.getPriority());
            response.setAuthorEmail(feedback.getAuthorEmail());
            response.setCreatedAt(feedback.getCreatedAt());
            response.setUpdatedAt(feedback.getUpdatedAt());
            response.setVotes(feedback.getVotes() != null ? feedback.getVotes() : 0);
            response.setAnonymous(feedback.isAnonymous());
            
            // Get author name - show "Anonymous" if anonymous is true
            if (feedback.isAnonymous()) {
                response.setAuthorName("Anonymous");
            } else {
                String authorEmail = feedback.getAuthorEmail();
                if (authorEmail != null) {
                    Optional<UserEntity> user = userRepository.findByEmail(authorEmail);
                    if (user.isPresent()) {
                        response.setAuthorName(user.get().getFullName());
                    } else {
                        response.setAuthorName(authorEmail.split("@")[0]);
                    }
                } else {
                    response.setAuthorName("Anonymous");
                }
            }
            
            // Check if current user has upvoted
            Set<String> upvotedUsers = feedback.getUpvotedUsers();
            response.setUserHasUpvoted(upvotedUsers != null && upvotedUsers.contains(currentUser));
            
            result.add(response);
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/user")
    public ResponseEntity<List<FeedbackResponse>> getUserFeedback(Authentication auth) {
        List<FeedbackEntity> feedbacks = feedbackRepository.findByAuthorEmail(auth.getName());
        List<FeedbackResponse> result = new ArrayList<>();
        
        for (FeedbackEntity feedback : feedbacks) {
            FeedbackResponse response = new FeedbackResponse();
            response.setFeedbackId(feedback.getFeedbackId());
            response.setTitle(feedback.getTitle());
            response.setDescription(feedback.getDescription());
            response.setCategory(feedback.getCategory());
            response.setStatus(feedback.getStatus() != null ? feedback.getStatus().toUpperCase() : "PENDING");
            response.setPriority(feedback.getPriority());
            response.setAuthorEmail(feedback.getAuthorEmail());
            response.setCreatedAt(feedback.getCreatedAt());
            response.setUpdatedAt(feedback.getUpdatedAt());
            response.setVotes(feedback.getVotes() != null ? feedback.getVotes() : 0);
            response.setAnonymous(feedback.isAnonymous());
            
            // Get author name - show "Anonymous" if anonymous is true
            if (feedback.isAnonymous()) {
                response.setAuthorName("Anonymous");
            } else {
                String authorEmail = feedback.getAuthorEmail();
                if (authorEmail != null) {
                    Optional<UserEntity> user = userRepository.findByEmail(authorEmail);
                    if (user.isPresent()) {
                        response.setAuthorName(user.get().getFullName());
                    } else {
                        response.setAuthorName(authorEmail.split("@")[0]);
                    }
                } else {
                    response.setAuthorName("Anonymous");
                }
            }
            
            result.add(response);
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFeedbackById(@PathVariable Long id, Authentication auth) {
        return feedbackRepository.findById(id)
                .map(feedback -> {
                    FeedbackResponse response = new FeedbackResponse();
                    response.setFeedbackId(feedback.getFeedbackId());
                    response.setTitle(feedback.getTitle());
                    response.setDescription(feedback.getDescription());
                    response.setCategory(feedback.getCategory());
                    response.setStatus(feedback.getStatus() != null ? feedback.getStatus().toUpperCase() : "PENDING");
                    response.setPriority(feedback.getPriority());
                    response.setAuthorEmail(feedback.getAuthorEmail());
                    response.setCreatedAt(feedback.getCreatedAt());
                    response.setUpdatedAt(feedback.getUpdatedAt());
                    response.setVotes(feedback.getVotes() != null ? feedback.getVotes() : 0);
                    response.setAnonymous(feedback.isAnonymous());
                    
                    // Get author name - show "Anonymous" if anonymous is true
                    if (feedback.isAnonymous()) {
                        response.setAuthorName("Anonymous");
                    } else {
                        String authorEmail = feedback.getAuthorEmail();
                        if (authorEmail != null) {
                            Optional<UserEntity> user = userRepository.findByEmail(authorEmail);
                            if (user.isPresent()) {
                                response.setAuthorName(user.get().getFullName());
                            } else {
                                response.setAuthorName(authorEmail.split("@")[0]);
                            }
                        } else {
                            response.setAuthorName("Anonymous");
                        }
                    }
                    
                    // Check if current user has upvoted
                    Set<String> upvotedUsers = feedback.getUpvotedUsers();
                    response.setUserHasUpvoted(upvotedUsers != null && upvotedUsers.contains(auth.getName()));
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FeedbackEntity> createFeedback(@RequestBody FeedbackEntity feedback, Authentication auth) {
        feedback.setFeedbackId(null);
        feedback.setAuthorEmail(auth.getName());
        String status = feedback.getStatus();
        if (status == null || status.isEmpty()) {
            feedback.setStatus("PENDING");
        } else {
            feedback.setStatus(status.toUpperCase());
        }
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setUpdatedAt(LocalDateTime.now());
        feedback.setVotes(0);
        feedback.setUpvotedUsers(new HashSet<>());
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
                    String newStatus = payload.get("status").toUpperCase();
                    existing.setStatus(newStatus);
                    existing.setUpdatedAt(LocalDateTime.now());
                    FeedbackEntity updated = feedbackRepository.save(existing);
                    
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
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable Long id) {
        List<CommentEntity> comments = commentRepository.findByFeedbackIdOrderByCreatedAtDesc(id);
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (CommentEntity comment : comments) {
            Map<String, Object> commentMap = new HashMap<>();
            commentMap.put("id", comment.getId());
            commentMap.put("content", comment.getContent());
            commentMap.put("createdAt", comment.getCreatedAt());
            commentMap.put("isAnonymous", comment.isAnonymous());
            
            if (comment.isAnonymous()) {
                commentMap.put("authorName", "Anonymous");
                commentMap.put("profilePicture", null);
            } else {
                String authorEmail = comment.getAuthorEmail();
                if (authorEmail != null) {
                    Optional<UserEntity> user = userRepository.findByEmail(authorEmail);
                    if (user.isPresent()) {
                        commentMap.put("authorName", user.get().getFullName());
                        commentMap.put("profilePicture", user.get().getProfilePicture());
                    } else {
                        commentMap.put("authorName", authorEmail.split("@")[0]);
                        commentMap.put("profilePicture", null);
                    }
                } else {
                    commentMap.put("authorName", "Anonymous");
                    commentMap.put("profilePicture", null);
                }
            }
            
            result.add(commentMap);
        }
        
        return ResponseEntity.ok(result);
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
                    comment.setAnonymous(Boolean.parseBoolean(payload.getOrDefault("anonymous", "false")));
                    CommentEntity saved = commentRepository.save(comment);
                    
                    // Only send notification if not anonymous
                    if (!comment.isAnonymous() && !feedback.getAuthorEmail().equals(auth.getName())) {
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
    public ResponseEntity<?> toggleUpvote(@PathVariable Long id, Authentication auth) {
        return feedbackRepository.findById(id)
                .map(feedback -> {
                    String userEmail = auth.getName();
                    Set<String> upvotedUsers = feedback.getUpvotedUsers();
                    if (upvotedUsers == null) {
                        upvotedUsers = new HashSet<>();
                    }
                    
                    int currentVotes = feedback.getVotes() != null ? feedback.getVotes() : 0;
                    
                    if (upvotedUsers.contains(userEmail)) {
                        upvotedUsers.remove(userEmail);
                        feedback.setVotes(currentVotes - 1);
                        feedback.setUpvotedUsers(upvotedUsers);
                        feedbackRepository.save(feedback);
                        
                        Map<String, Object> response = new HashMap<>();
                        response.put("message", "Upvote removed successfully");
                        response.put("votes", feedback.getVotes());
                        response.put("upvoted", false);
                        return ResponseEntity.ok(response);
                    } else {
                        upvotedUsers.add(userEmail);
                        feedback.setVotes(currentVotes + 1);
                        feedback.setUpvotedUsers(upvotedUsers);
                        feedbackRepository.save(feedback);
                        
                        Map<String, Object> response = new HashMap<>();
                        response.put("message", "Upvoted successfully");
                        response.put("votes", feedback.getVotes());
                        response.put("upvoted", true);
                        return ResponseEntity.ok(response);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/has-upvoted")
    public ResponseEntity<?> hasUserUpvoted(@PathVariable Long id, Authentication auth) {
        return feedbackRepository.findById(id)
                .map(feedback -> {
                    Set<String> upvotedUsers = feedback.getUpvotedUsers();
                    boolean hasUpvoted = upvotedUsers != null && upvotedUsers.contains(auth.getName());
                    Map<String, Object> response = new HashMap<>();
                    response.put("hasUpvoted", hasUpvoted);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ========== DASHBOARD DATA ENDPOINT ==========
    
    @GetMapping("/dashboard-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getDashboardData(Authentication auth) {
        Map<String, Object> dashboardData = new HashMap<>();
        
        // 1. Get stats
        Map<String, Object> stats = getStats();
        dashboardData.put("stats", stats);
        
        // 2. Get all feedback with details
        List<Map<String, Object>> feedbacks = getAllFeedbackWithDetails(auth);
        dashboardData.put("feedbacks", feedbacks);
        
        return ResponseEntity.ok(dashboardData);
    }
    
    // Helper method for stats
    private Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        long total = feedbackRepository.count();
        long pending = feedbackRepository.countByStatusIgnoreCase("PENDING");
        long inReview = feedbackRepository.countByStatusIgnoreCase("IN_REVIEW");
        long resolved = feedbackRepository.countByStatusIgnoreCase("RESOLVED");
        
        stats.put("totalFeedback", total);
        stats.put("pending", pending);
        stats.put("inReview", inReview);
        stats.put("resolved", resolved);
        
        return stats;
    }
    
    // Helper method for feedback with all details
    private List<Map<String, Object>> getAllFeedbackWithDetails(Authentication auth) {
        List<FeedbackEntity> feedbacks = feedbackRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        String currentUser = auth.getName();
        
        for (FeedbackEntity feedback : feedbacks) {
            Map<String, Object> feedbackMap = new HashMap<>();
            Long feedbackId = feedback.getFeedbackId();
            
            // Basic info
            feedbackMap.put("feedbackId", feedbackId);
            feedbackMap.put("title", feedback.getTitle());
            feedbackMap.put("description", feedback.getDescription());
            feedbackMap.put("category", feedback.getCategory());
            feedbackMap.put("status", feedback.getStatus() != null ? feedback.getStatus().toUpperCase() : "PENDING");
            feedbackMap.put("priority", feedback.getPriority());
            feedbackMap.put("authorEmail", feedback.getAuthorEmail());
            feedbackMap.put("createdAt", feedback.getCreatedAt());
            feedbackMap.put("votes", feedback.getVotes() != null ? feedback.getVotes() : 0);
            feedbackMap.put("anonymous", feedback.isAnonymous());
            
            // Author name (or Anonymous)
            if (feedback.isAnonymous()) {
                feedbackMap.put("authorName", "Anonymous");
            } else {
                String authorEmail = feedback.getAuthorEmail();
                if (authorEmail != null) {
                    Optional<UserEntity> user = userRepository.findByEmail(authorEmail);
                    if (user.isPresent()) {
                        feedbackMap.put("authorName", user.get().getFullName());
                    } else {
                        feedbackMap.put("authorName", authorEmail.split("@")[0]);
                    }
                } else {
                    feedbackMap.put("authorName", "Anonymous");
                }
            }
            
            // User has upvoted?
            Set<String> upvotedUsers = feedback.getUpvotedUsers();
            feedbackMap.put("userHasUpvoted", upvotedUsers != null && upvotedUsers.contains(currentUser));
            
            // Comment count
            int commentCount = commentRepository.countByFeedbackId(feedbackId);
            feedbackMap.put("commentCount", commentCount);
            
            result.add(feedbackMap);
        }
        
        // Sort by votes (highest first)
        result.sort((a, b) -> ((Integer)b.get("votes")) - ((Integer)a.get("votes")));
        
        return result;
    }
}