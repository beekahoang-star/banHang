package com.ecommerce.platform.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public class AuthDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        private String email;

        @NotBlank(message = "Mật khẩu không được để trống")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        private String email;

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
        private String password;

        @NotBlank(message = "Họ tên không được để trống")
        private String fullName;

        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        @Builder.Default
        private String tokenType = "Bearer";
        private UserInfo user;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private String avatarUrl;
        private BigDecimal cancelOrderRate;
        private Set<String> roles;
        private Set<String> permissions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfileDto {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private String avatarUrl;
        private BigDecimal cancelOrderRate;
        private Set<String> roles;
        private Set<String> permissions;
        private List<AddressDto> addresses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDto {
        private Long id;
        private String receiverName;
        private String receiverPhone;
        private String province;
        private String district;
        private String ward;
        private String detailAddress;
        private Boolean isDefault;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressRequest {
        @NotBlank(message = "Tên người nhận không được để trống")
        private String receiverName;

        @NotBlank(message = "Số điện thoại không được để trống")
        private String receiverPhone;

        @NotBlank(message = "Tỉnh/Thành phố không được để trống")
        private String province;

        @NotBlank(message = "Quận/Huyện không được để trống")
        private String district;

        @NotBlank(message = "Phường/Xã không được để trống")
        private String ward;

        @NotBlank(message = "Địa chỉ chi tiết không được để trống")
        private String detailAddress;

        private Boolean isDefault = false;
    }
}
