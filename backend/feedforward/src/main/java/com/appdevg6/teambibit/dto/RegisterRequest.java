package com.appdevg6.teambibit.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String department;

    // Getters
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
    public String getDepartment() { return department; }
    
    // Add these aliases if needed
    public String getFullName() { return name; }
    public String getUsername() { return email; }

    // Setters
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(String role) { this.role = role; }
    public void setDepartment(String department) { this.department = department; }
}