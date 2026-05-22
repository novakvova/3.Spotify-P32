package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.*;
import org.example.entities.RoleEntity;
import org.example.mappers.RoleMapper;
import org.example.repositories.IRoleRepository;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final IRoleRepository roleRepository;
    private final RoleMapper mapper;

    // CRUD ОПЕРАЦІЇ
    public List<RoleDto> getAll() {
        return roleRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public RoleDto getById(Long id) {
        return roleRepository.findById(id)
                .map(mapper::toDto)
                .orElse(null);
    }

    public RoleDto create(CreateRoleDto dto) {
        RoleEntity entity = mapper.toEntity(dto);
        RoleEntity saved = roleRepository.save(entity);
        return mapper.toDto(saved);
    }

    public RoleDto update(Long id, UpdateRoleDto dto) {
        return roleRepository.findById(id)
                .map(existing -> {
                    existing.setName(dto.getName());
                    return mapper.toDto(roleRepository.save(existing));
                })
                .orElse(null);
    }

    public void delete(Long id) {
        roleRepository.deleteById(id);
    }
}
