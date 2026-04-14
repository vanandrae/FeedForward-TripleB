package com.appdevg6.teambibit.service;

import com.appdevg6.teambibit.dto.RegisterRequest;
import com.appdevg6.teambibit.entity.UserEntity;
import com.appdevg6.teambibit.repository.UserRepository;
import com.appdevg6.teambibit.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public Map<String, Object> register(RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        String fullName = request.getFullName();
        if (fullName == null || fullName.isBlank()) {
            fullName = request.getUsername();
        }
        if (fullName == null || fullName.isBlank()) {
            fullName = request.getName();
        }

        if (fullName == null || fullName.isBlank()) {
            response.put("success", false);
            response.put("message", "Full name is required.");
            return response;
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            response.put("success", false);
            response.put("message", "Email is already registered.");
            return response;
        }

        UserEntity user = new UserEntity(
                fullName,
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT",
                request.getDepartment()
        );

        userRepository.save(user);

        response.put("success", true);
        response.put("message", "User registered successfully.");
        return response;
    }

    public Map<String, Object> login(String email, String password) {
        Map<String, Object> response = new HashMap<>();

        Optional<UserEntity> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            response.put("success", false);
            response.put("message", "Invalid email or password.");
            return response;
        }

        UserEntity user = optionalUser.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            response.put("success", false);
            response.put("message", "Invalid email or password.");
            return response;
        }

        String token = jwtUtils.generateToken(user.getEmail());

        response.put("success", true);
        response.put("token", token);
        response.put("userId", user.getUserId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("department", user.getDepartment());
        return response;
    }

    public Map<String, Object> getProfileByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return toPublicUserMap(user);
    }

    public Map<String, Object> updateProfileByEmail(String email, Map<String, String> payload) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (payload.containsKey("fullName")) {
            user.setFullName(payload.get("fullName"));
        }
        if (payload.containsKey("department")) {
            user.setDepartment(payload.get("department"));
        }

        userRepository.save(user);
        return toPublicUserMap(user);
    }

    public List<Map<String, Object>> getAllUsers() {
        List<Map<String, Object>> users = new ArrayList<>();
        for (UserEntity user : userRepository.findAll()) {
            users.add(toPublicUserMap(user));
        }
        return users;
    }

    public Map<String, Object> updateUserRole(Long id, String role) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        user.setRole(role.toUpperCase());
        userRepository.save(user);
        return toPublicUserMap(user);
    }

    private Map<String, Object> toPublicUserMap(UserEntity user) {
        Map<String, Object> publicUser = new HashMap<>();
        publicUser.put("userId", user.getUserId());
        publicUser.put("fullName", user.getFullName());
        publicUser.put("email", user.getEmail());
        publicUser.put("role", user.getRole());
        publicUser.put("department", user.getDepartment());
        return publicUser;
    }
}