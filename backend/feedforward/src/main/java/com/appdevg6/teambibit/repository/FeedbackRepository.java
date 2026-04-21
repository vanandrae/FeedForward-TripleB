package com.appdevg6.teambibit.repository;

import com.appdevg6.teambibit.entity.FeedbackEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackEntity, Long> {
    List<FeedbackEntity> findByAuthorEmail(String authorEmail);
    long countByStatusIgnoreCase(String status);
}