package com.appdevg6.teambibit.repository;

import com.appdevg6.teambibit.entity.ReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<ReportEntity, Long> {
    List<ReportEntity> findByStatus(String status);
    List<ReportEntity> findByFeedbackId(Long feedbackId);
}