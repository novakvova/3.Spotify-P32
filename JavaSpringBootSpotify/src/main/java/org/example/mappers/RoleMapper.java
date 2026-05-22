package org.example.mappers;

import org.example.dtos.*;
import org.example.entities.RoleEntity;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {
    public RoleDto toDto(RoleEntity entity) {
        RoleDto dto = new RoleDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        return dto;
    }

    public RoleEntity toEntity(CreateRoleDto dto) {
        RoleEntity entity = new RoleEntity();
        entity.setName(dto.getName());
        return entity;
    }
}
