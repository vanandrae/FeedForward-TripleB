package com.appdevg6.teambibit.service;

import com.appdevg6.teambibit.entity.FeedbackEntity;
import com.appdevg6.teambibit.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public List<FeedbackEntity> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    public List<FeedbackEntity> getFeedbackByAuthorEmail(String authorEmail) {
        return feedbackRepository.findByAuthorEmail(authorEmail);
    }

    public FeedbackEntity getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Feedback " + id + " not found"));
    }

    public FeedbackEntity createFeedback(FeedbackEntity feedback, String authorEmail) {
        feedback.setFeedbackId(null);
        feedback.setAuthorEmail(authorEmail);
        feedback.setStatus(feedback.getStatus() == null ? "PENDING" : feedback.getStatus().toUpperCase());
        LocalDateTime now = LocalDateTime.now();
        feedback.setCreatedAt(now);
        feedback.setUpdatedAt(now);
        return feedbackRepository.save(feedback);
    }

    public FeedbackEntity updateFeedback(Long id, FeedbackEntity updatedFeedback, String authorEmail) {
        FeedbackEntity existing = getFeedbackById(id);
        if (!existing.getAuthorEmail().equalsIgnoreCase(authorEmail)) {
            throw new IllegalArgumentException("You are not allowed to update this feedback.");
        }

        existing.setTitle(updatedFeedback.getTitle());
        existing.setDescription(updatedFeedback.getDescription());
        existing.setCategory(updatedFeedback.getCategory());
        existing.setUpdatedAt(LocalDateTime.now());
        return feedbackRepository.save(existing);
    }

    public FeedbackEntity updateFeedbackStatus(Long id, String status) {
        FeedbackEntity existing = getFeedbackById(id);
        existing.setStatus(status.toUpperCase());
        existing.setUpdatedAt(LocalDateTime.now());
        return feedbackRepository.save(existing);
    }

    public void deleteFeedback(Long id, String authorEmail) {
        FeedbackEntity existing = getFeedbackById(id);
        if (!existing.getAuthorEmail().equalsIgnoreCase(authorEmail)) {
            throw new IllegalArgumentException("You are not allowed to delete this feedback.");
        }
        feedbackRepository.deleteById(id);
    }

    public Map<String, Object> getDashboardStats() {
        long total = feedbackRepository.count();
        long pending = feedbackRepository.countByStatusIgnoreCase("PENDING");
        long inReview = feedbackRepository.countByStatusIgnoreCase("IN_REVIEW");
        long resolved = feedbackRepository.countByStatusIgnoreCase("RESOLVED");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFeedback", total);
        stats.put("pending", pending);
        stats.put("inReview", inReview);
        stats.put("resolved", resolved);
        return stats;
    }

    public Map<String, Object> getResolutionProgress() {
        long total = feedbackRepository.count();
        long resolved = feedbackRepository.countByStatusIgnoreCase("RESOLVED");
        double percentage = total == 0 ? 0 : (resolved * 100.0) / total;

        Map<String, Object> progress = new HashMap<>();
        progress.put("resolved", resolved);
        progress.put("total", total);
        progress.put("percentage", Math.round(percentage * 100.0) / 100.0);
        return progress;
    }
}