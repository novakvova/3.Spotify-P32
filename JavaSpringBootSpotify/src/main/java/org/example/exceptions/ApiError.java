package org.example.exceptions;

import java.time.Instant;

public record ApiError(String code, String message, String field, Instant timestamp) {

    public static ApiError of(String code, String message, String field) {
        return new ApiError(code, message, field, Instant.now());
    }
}