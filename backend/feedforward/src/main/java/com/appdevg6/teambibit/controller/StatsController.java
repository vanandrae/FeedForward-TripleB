package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    private final FeedbackService feedbackService;

    public StatsController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(feedbackService.getDashboardStats());
    }

    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getResolutionProgress() {
        return ResponseEntity.ok(feedbackService.getResolutionProgress());
    }
}