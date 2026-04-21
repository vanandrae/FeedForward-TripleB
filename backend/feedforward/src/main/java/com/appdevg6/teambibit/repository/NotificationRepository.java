package com.appdevg6.teambibit.repository;

import com.appdevg6.teambibit.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<NotificationEntity> findByUserEmailAndIsReadFalse(String userEmail);
    long countByUserEmailAndIsReadFalse(String userEmail);
}