package com.appdevg6.teambibit.repository;

import com.appdevg6.teambibit.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    List<CommentEntity> findByFeedbackIdOrderByCreatedAtDesc(Long feedbackId);

    int countByFeedbackId(Long feedbackId);

    @org.springframework.data.jpa.repository.Query("SELECT c.feedbackId, COUNT(c) FROM CommentEntity c GROUP BY c.feedbackId")
    List<Object[]> countCommentsByFeedbackId();
}