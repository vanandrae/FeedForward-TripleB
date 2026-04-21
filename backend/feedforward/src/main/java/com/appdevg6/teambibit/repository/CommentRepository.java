package com.appdevg6.teambibit.repository;

import com.appdevg6.teambibit.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    List<CommentEntity> findByFeedbackIdOrderByCreatedAtDesc(Long feedbackId);
}