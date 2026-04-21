package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:3000")
public class StatsController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long total = feedbackRepository.count();
        long pending = feedbackRepository.countByStatusIgnoreCase("PENDING");
        long inReview = feedbackRepository.countByStatusIgnoreCase("IN_REVIEW");
        long resolved = feedbackRepository.countByStatusIgnoreCase("RESOLVED");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFeedback", total);
        stats.put("pending", pending);
        stats.put("inReview", inReview);
        stats.put("resolved", resolved);
        
        return ResponseEntity.ok(stats);
    }
}