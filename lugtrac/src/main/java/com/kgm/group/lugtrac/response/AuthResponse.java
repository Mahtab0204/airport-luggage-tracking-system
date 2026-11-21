package com.kgm.group.lugtrac.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private final String token;
    private final String role;
}