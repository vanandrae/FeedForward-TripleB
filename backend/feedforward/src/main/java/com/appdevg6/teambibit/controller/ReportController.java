package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.entity.*;
import com.appdevg6.teambibit.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Create a report (Faculty/Admin)
    @PostMapping("/api/reports/create")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<?> createReport(@RequestBody Map<String, Object> payload, Authentication auth) {
        try {
            Long feedbackId = Long.valueOf(payload.get("feedbackId").toString());
            String reason = payload.get("reason").toString();
            
            Optional<FeedbackEntity> feedback = feedbackRepository.findById(feedbackId);
            if (!feedback.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Feedback not found"));
            }
            
            ReportEntity report = new ReportEntity();
            report.setFeedbackId(feedbackId);
            report.setFeedbackTitle(feedback.get().getTitle());
            report.setReportedBy(auth.getName());
            report.setReason(reason);
            report.setStatus("pending");
            
            reportRepository.save(report);
            
            return ResponseEntity.ok(Map.of("message", "Report submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get all reports (Admin only)
    @GetMapping("/api/admin/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReportEntity>> getAllReports() {
        return ResponseEntity.ok(reportRepository.findAll());
    }
    
    // Resolve a report (Admin only)
    @PutMapping("/api/admin/reports/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resolveReport(@PathVariable Long id) {
        Optional<ReportEntity> report = reportRepository.findById(id);
        if (report.isPresent()) {
            report.get().setStatus("resolved");
            reportRepository.save(report.get());
            return ResponseEntity.ok(Map.of("message", "Report resolved"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Report not found"));
    }
    
    // Delete feedback and notify users (Admin only)
    @DeleteMapping("/api/admin/feedback/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        try {
            Optional<FeedbackEntity> feedback = feedbackRepository.findById(id);
            if (!feedback.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Feedback not found"));
            }
            
            String authorEmail = feedback.get().getAuthorEmail();
            
            // Get all reports for this feedback
            List<ReportEntity> reports = reportRepository.findByFeedbackId(id);
            
            // Notify the student who submitted the feedback
            if (authorEmail != null) {
                NotificationEntity studentNotif = new NotificationEntity();
                studentNotif.setUserEmail(authorEmail);
                studentNotif.setTitle("Your feedback was removed");
                studentNotif.setMessage("Your feedback \"" + feedback.get().getTitle() + "\" has been removed by an admin due to policy violation.");
                studentNotif.setType("feedback_deleted");
                studentNotif.setRelatedId(id);
                notificationRepository.save(studentNotif);
            }
            
            // Notify faculty who reported this feedback
            for (ReportEntity report : reports) {
                NotificationEntity facultyNotif = new NotificationEntity();
                facultyNotif.setUserEmail(report.getReportedBy());
                facultyNotif.setTitle("Report action taken");
                facultyNotif.setMessage("The feedback you reported (\"" + feedback.get().getTitle() + "\") has been removed by an admin.");
                facultyNotif.setType("report_resolved");
                facultyNotif.setRelatedId(id);
                notificationRepository.save(facultyNotif);
            }
            
            // Delete the feedback
            feedbackRepository.deleteById(id);
            
            return ResponseEntity.ok(Map.of("message", "Feedback deleted and notifications sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get user notifications
    @GetMapping("/api/notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationEntity>> getUserNotifications(Authentication auth) {
        return ResponseEntity.ok(notificationRepository.findByUserEmailOrderByCreatedAtDesc(auth.getName()));
    }
    
    // Mark notification as read
    @PutMapping("/api/notifications/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id, Authentication auth) {
        Optional<NotificationEntity> notif = notificationRepository.findById(id);
        if (notif.isPresent() && notif.get().getUserEmail().equals(auth.getName())) {
            notif.get().setRead(true);
            notificationRepository.save(notif.get());
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Notification not found"));
    }
    
    // Mark all notifications as read
    @PutMapping("/api/notifications/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAllAsRead(Authentication auth) {
        List<NotificationEntity> notifications = notificationRepository.findByUserEmailAndIsReadFalse(auth.getName());
        for (NotificationEntity notif : notifications) {
            notif.setRead(true);
            notificationRepository.save(notif);
        }
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
    
    // Get unread count
    @GetMapping("/api/notifications/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        long count = notificationRepository.countByUserEmailAndIsReadFalse(auth.getName());
        return ResponseEntity.ok(Map.of("count", count));
    }
}