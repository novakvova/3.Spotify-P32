package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.dtos.AdminCreateUserDto;
import org.example.dtos.AdminUserDto;
import org.example.dtos.BlockUserDto;
import org.example.dtos.UpdateUserRolesDto;
import org.example.services.AdminUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
@Tag(name = "Admin Users", description = "User management endpoints for administrators")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @PostMapping
    @Operation(summary = "Create new user")
    public ResponseEntity<AdminUserDto> createUser(@RequestBody AdminCreateUserDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createUser(dto));
    }

    @PutMapping("/{id}/roles")
    @Operation(summary = "Update user roles")
    public ResponseEntity<AdminUserDto> updateRoles(
            @PathVariable Long id,
            @RequestBody UpdateUserRolesDto dto
    ) {
        return ResponseEntity.ok(adminUserService.updateRoles(id, dto.getRoles()));
    }

    @PatchMapping("/{id}/block")
    @Operation(summary = "Block or unblock user")
    public ResponseEntity<AdminUserDto> setBlocked(
            @PathVariable Long id,
            @RequestBody BlockUserDto dto
    ) {
        return ResponseEntity.ok(adminUserService.setBlocked(id, dto.isBlocked()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
    }
}