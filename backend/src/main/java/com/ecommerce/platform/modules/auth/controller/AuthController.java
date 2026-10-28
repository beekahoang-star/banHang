package com.ecommerce.platform.modules.auth.controller;

import com.ecommerce.platform.common.response.ApiResponse;
import com.ecommerce.platform.common.security.UserPrincipal;
import com.ecommerce.platform.modules.auth.dto.AuthDto;
import com.ecommerce.platform.modules.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Auth Module", description = "Đăng nhập, đăng ký và quản lý tài khoản khách hàng / quản trị")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/api/v1/public/auth/login")
    @Operation(summary = "Đăng nhập tài khoản (JWT)")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        AuthDto.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }

    @PostMapping("/api/v1/public/auth/register")
    @Operation(summary = "Đăng ký tài khoản khách hàng mới")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        AuthDto.AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký tài khoản thành công", response));
    }

    @GetMapping("/api/v1/customer/profile")
    @Operation(summary = "Lấy thông tin cá nhân và sổ địa chỉ của tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<AuthDto.UserProfileDto>> getProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        AuthDto.UserProfileDto profile = authService.getProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PostMapping("/api/v1/customer/addresses")
    @Operation(summary = "Thêm địa chỉ giao hàng mới vào sổ địa chỉ")
    public ResponseEntity<ApiResponse<AuthDto.AddressDto>> addAddress(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody AuthDto.AddressRequest request) {
        AuthDto.AddressDto address = authService.addAddress(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Thêm địa chỉ thành công", address));
    }
}
