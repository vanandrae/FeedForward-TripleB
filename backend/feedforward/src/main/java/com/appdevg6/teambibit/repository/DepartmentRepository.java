package com.appdevg6.teambibit.repository;

import com.appdevg6.teambibit.entity.DepartmentEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Long> {

}
