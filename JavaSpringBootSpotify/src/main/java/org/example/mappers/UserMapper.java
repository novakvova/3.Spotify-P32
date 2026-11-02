package org.example.mappers;

import org.example.dtos.UserDto;
import org.example.entities.RoleEntity;
import org.example.entities.UserEntity;

import java.util.TreeSet;
import java.util.stream.Collectors;

public final class UserMapper {

    private UserMapper() {}

    public static UserDto toDto(UserEntity user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getFullName(),
                user.getBirthDate(),
                user.getGender(),
                user.getImage() == null || user.getImage().isBlank()
                        ? null
                        : "/uploads/medium/" + user.getImage(),
                user.getPremiumUntil(),
                user.getRoles().stream()
                        .map(RoleEntity::getName)
                        .collect(Collectors.toCollection(TreeSet::new)));
    }
}