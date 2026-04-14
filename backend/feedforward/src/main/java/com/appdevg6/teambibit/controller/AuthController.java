package com.appdevg6.teambibit.controller;

import com.appdevg6.teambibit.dto.LoginRequest;
import com.appdevg6.teambibit.dto.RegisterRequest;
import com.appdevg6.teambibit.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        Map<String, Object> response = userService.register(request);
        boolean success = (boolean) response.get("success");
        return success
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = userService.login(request.getEmail(), request.getPassword());
        boolean success = (boolean) response.get("success");
        return success
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(401).body(response);
    }
}