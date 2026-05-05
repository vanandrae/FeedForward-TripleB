package com.appdevg6.teambibit.service;

import com.appdevg6.teambibit.entity.UserEntity;
import com.appdevg6.teambibit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Get all users with limited fields
    public List<Map<String, Object>> getAllUsers() {
        List<UserEntity> users = userRepository.findAll();
        List<Map<String, Object>> userList = new ArrayList<>();
        
        for (UserEntity user : users) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("userId", user.getUserId());
            userMap.put("fullName", user.getFullName());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole());
            userMap.put("department", user.getDepartment());
            userMap.put("profilePicture", user.getProfilePicture());
            userMap.put("banned", user.isBanned());
            userList.add(userMap);
        }
        return userList;
    }
    
    // Update user role
    public Map<String, Object> updateUserRole(Long id, String role) {
        UserEntity user = userRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("User " + id + " not found"));
        
        user.setRole(role.toUpperCase());
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Role updated successfully");
        response.put("userId", user.getUserId());
        response.put("role", user.getRole());
        return response;
    }
    
    // Get profile by email - INCLUDES profile picture
    public Map<String, Object> getProfileByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NoSuchElementException("User not found"));
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("userId", user.getUserId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("department", user.getDepartment());
        profile.put("createdAt", user.getCreatedAt());
        profile.put("profilePicture", user.getProfilePicture()); // Added
        profile.put("banned", user.isBanned());
        
        return profile;
    }
    
public Map<String, Object> updateProfileByEmail(String email, Map<String, String> payload) {
    UserEntity user = userRepository.findByEmail(email)
        .orElseThrow(() -> new NoSuchElementException("User not found"));
    
    if (payload.containsKey("fullName")) {
        user.setFullName(payload.get("fullName"));
    }
    if (payload.containsKey("department")) {
        user.setDepartment(payload.get("department"));
    }
    
    if (payload.containsKey("newPassword") && !payload.get("newPassword").isEmpty()) {
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Current password is incorrect");
            return errorResponse;
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
    }
    
    userRepository.save(user);
    
    Map<String, Object> response = new HashMap<>();
    response.put("message", "Profile updated successfully");
    response.put("userId", user.getUserId());
    response.put("fullName", user.getFullName());
    response.put("email", user.getEmail());
    response.put("department", user.getDepartment());
    
    return response;
}
    
    // Register new user
    public UserEntity registerUser(String fullName, String email, String password, String role, String department) {
        UserEntity user = new UserEntity();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role != null ? role : "student");
        user.setDepartment(department);
        
        return userRepository.save(user);
    }
    
    // Ban or unban user
    public Map<String, Object> toggleBanUser(Long id, boolean banned) {
        UserEntity user = userRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("User " + id + " not found"));
        
        user.setBanned(banned);
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", banned ? "User banned successfully" : "User unbanned successfully");
        response.put("userId", user.getUserId());
        response.put("banned", user.isBanned());
        return response;
    }
    
    // Delete user
    public Map<String, Object> deleteUser(Long id) {
        UserEntity user = userRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("User " + id + " not found"));
        
        userRepository.deleteById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        response.put("userId", id);
        return response;
    }
    
    // Check if email exists
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    // Get user by email
    public Optional<UserEntity> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    // Get user by ID
    public Optional<UserEntity> getUserById(Long id) {
        return userRepository.findById(id);
    }
}