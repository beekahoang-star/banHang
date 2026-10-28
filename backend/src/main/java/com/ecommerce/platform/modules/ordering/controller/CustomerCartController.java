package com.ecommerce.platform.modules.ordering.controller;

import com.ecommerce.platform.common.response.ApiResponse;
import com.ecommerce.platform.common.security.UserPrincipal;
import com.ecommerce.platform.modules.ordering.dto.OrderDto;
import com.ecommerce.platform.modules.ordering.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/cart")
@RequiredArgsConstructor
@Tag(name = "Customer Cart API", description = "Quản lý giỏ hàng khách hàng, đồng bộ local và database")
public class CustomerCartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Lấy giỏ hàng của khách hàng hiện tại")
    public ResponseEntity<ApiResponse<OrderDto.CartDto>> getCart(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.getCart(currentUser.getId())));
    }

    @PostMapping("/items")
    @Operation(summary = "Thêm sản phẩm vào giỏ hàng")
    public ResponseEntity<ApiResponse<OrderDto.CartDto>> addToCart(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody OrderDto.AddToCartRequest request) {
        OrderDto.CartDto cart = cartService.addToCart(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đã thêm vào giỏ hàng", cart));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Cập nhật số lượng sản phẩm trong giỏ hàng")
    public ResponseEntity<ApiResponse<OrderDto.CartDto>> updateCartItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long itemId,
            @Valid @RequestBody OrderDto.UpdateCartItemRequest request) {
        OrderDto.CartDto cart = cartService.updateCartItem(currentUser.getId(), itemId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật giỏ hàng thành công", cart));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Xóa sản phẩm khỏi giỏ hàng")
    public ResponseEntity<ApiResponse<OrderDto.CartDto>> removeCartItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long itemId) {
        OrderDto.CartDto cart = cartService.removeCartItem(currentUser.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa khỏi giỏ hàng", cart));
    }

    @DeleteMapping
    @Operation(summary = "Làm rỗng giỏ hàng")
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserPrincipal currentUser) {
        cartService.clearCart(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đã dọn sạch giỏ hàng", null));
    }
}
