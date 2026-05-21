package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.dtos.RoleDto;
import org.example.services.RoleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/roles")
@Tag(name = "Roles", description = "Role Management API")
public class RoleController {
    private final RoleService roleService;

    // ОТРИМАТИ ВСІ РОЛІ
    @GetMapping
    @Operation(summary = "Get all roles", description = "Retrieve list of all roles")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<List<RoleDto>> getAll() {
        List<RoleDto> roles = roleService.getAll();
        return ResponseEntity.ok(roles);
    }

    // ОТРИМАТИ РОЛЬ ПО ID
    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID", description = "Retrieve a specific role by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Role found"),
            @ApiResponse(responseCode = "404", description = "Role not found")
    })
    public ResponseEntity<RoleDto> getById(@PathVariable Long id) {
        RoleDto role = roleService.getById(id);
        if (role == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(role);
    }

    // СТВОРИТИ НОВУ РОЛЬ
    @PostMapping
    @Operation(summary = "Create new role", description = "Create a new role")
    @ApiResponse(responseCode = "201", description = "Role created successfully")
    public ResponseEntity<RoleDto> create(@RequestBody RoleDto dto) {
        RoleDto created = roleService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ОНОВИТИ РОЛЬ
    @PutMapping("/{id}")
    @Operation(summary = "Update role", description = "Update an existing role")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Role updated successfully"),
            @ApiResponse(responseCode = "404", description = "Role not found")
    })
    public ResponseEntity<RoleDto> update(@PathVariable Long id, @RequestBody RoleDto dto) {
        RoleDto updated = roleService.update(id, dto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // ВИДАЛИТИ РОЛЬ
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete role", description = "Delete a role by ID")
    @ApiResponse(responseCode = "204", description = "Role deleted successfully")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
