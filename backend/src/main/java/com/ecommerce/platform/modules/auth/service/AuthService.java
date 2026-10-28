package com.ecommerce.platform.modules.auth.service;

import com.ecommerce.platform.common.exception.AppException;
import com.ecommerce.platform.common.exception.ErrorCode;
import com.ecommerce.platform.common.security.JwtTokenProvider;
import com.ecommerce.platform.modules.auth.dto.AuthDto;
import com.ecommerce.platform.modules.auth.entity.Role;
import com.ecommerce.platform.modules.auth.entity.User;
import com.ecommerce.platform.modules.auth.entity.UserAddress;
import com.ecommerce.platform.modules.auth.repository.RoleRepository;
import com.ecommerce.platform.modules.auth.repository.UserAddressRepository;
import com.ecommerce.platform.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserAddressRepository userAddressRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = tokenProvider.generateToken(authentication);
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            return AuthDto.AuthResponse.builder()
                    .accessToken(token)
                    .tokenType("Bearer")
                    .user(toUserInfo(user))
                    .build();
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Role customerRole = roleRepository.findByCode("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .code("ROLE_CUSTOMER")
                        .name("Khách hàng")
                        .build()));

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = tokenProvider.generateToken(authentication);

        return AuthDto.AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(toUserInfo(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthDto.UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<UserAddress> addresses = userAddressRepository.findByUserIdOrderByIsDefaultDesc(userId);

        List<AuthDto.AddressDto> addressDtos = addresses.stream()
                .map(addr -> AuthDto.AddressDto.builder()
                        .id(addr.getId())
                        .receiverName(addr.getReceiverName())
                        .receiverPhone(addr.getReceiverPhone())
                        .province(addr.getProvince())
                        .district(addr.getDistrict())
                        .ward(addr.getWard())
                        .detailAddress(addr.getDetailAddress())
                        .isDefault(addr.getIsDefault())
                        .build())
                .collect(Collectors.toList());

        return AuthDto.UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .cancelOrderRate(user.getCancelOrderRate())
                .roles(user.getRoles().stream().map(Role::getCode).collect(Collectors.toSet()))
                .permissions(user.getRoles().stream()
                        .flatMap(r -> r.getPermissions().stream())
                        .map(p -> p.getName())
                        .collect(Collectors.toSet()))
                .addresses(addressDtos)
                .build();
    }

    @Transactional
    public AuthDto.AddressDto addAddress(Long userId, AuthDto.AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            List<UserAddress> existing = userAddressRepository.findByUserIdOrderByIsDefaultDesc(userId);
            existing.forEach(a -> a.setIsDefault(false));
            userAddressRepository.saveAll(existing);
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .detailAddress(request.getDetailAddress())
                .isDefault(request.getIsDefault() != null && request.getIsDefault())
                .build();

        address = userAddressRepository.save(address);

        return AuthDto.AddressDto.builder()
                .id(address.getId())
                .receiverName(address.getReceiverName())
                .receiverPhone(address.getReceiverPhone())
                .province(address.getProvince())
                .district(address.getDistrict())
                .ward(address.getWard())
                .detailAddress(address.getDetailAddress())
                .isDefault(address.getIsDefault())
                .build();
    }

    private AuthDto.UserInfo toUserInfo(User user) {
        return AuthDto.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .cancelOrderRate(user.getCancelOrderRate())
                .roles(user.getRoles().stream().map(Role::getCode).collect(Collectors.toSet()))
                .permissions(user.getRoles().stream()
                        .flatMap(r -> r.getPermissions().stream())
                        .map(p -> p.getName())
                        .collect(Collectors.toSet()))
                .build();
    }
}
