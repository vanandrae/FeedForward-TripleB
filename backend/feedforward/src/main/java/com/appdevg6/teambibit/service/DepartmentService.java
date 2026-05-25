package com.appdevg6.teambibit.service;

import com.appdevg6.teambibit.entity.DepartmentEntity;
import com.appdevg6.teambibit.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;


    public DepartmentEntity createDepartment(DepartmentEntity department) {
        return departmentRepository.save(department);
    }


    public List<DepartmentEntity> getAllDepartments() {
        return departmentRepository.findAll();
    }


    public DepartmentEntity getDepartmentById(Long id) {
        Optional<DepartmentEntity> department = departmentRepository.findById(id);
        if (department.isPresent()) {
            return department.get();
        } else {
            throw new NoSuchElementException("Department " + id + " not found");
        }
    }


    public DepartmentEntity updateDepartment(Long id, DepartmentEntity departmentDetails) {
        try {

            DepartmentEntity department = departmentRepository.findById(id).get();
            department.setDepartmentName(departmentDetails.getDepartmentName());
            department.setDescription(departmentDetails.getDescription());
            return departmentRepository.save(department);
        } catch (NoSuchElementException ex) {
            throw new NoSuchElementException("Department " + id + " not found");
        }
    }


    public String deleteDepartment(Long id) {
        String msg = "";
        if (departmentRepository.findById(id).isPresent()) {
            departmentRepository.deleteById(id);
            msg = "Department " + id + " is successfully deleted!";
        } else {
            msg = "Department " + id + " does not exist.";
        }
        return msg;
    }
}