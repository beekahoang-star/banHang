package com.ecommerce.platform.modules.ordering.service;

import com.ecommerce.platform.common.exception.AppException;
import com.ecommerce.platform.common.exception.ErrorCode;
import com.ecommerce.platform.modules.auth.entity.User;
import com.ecommerce.platform.modules.auth.repository.UserRepository;
import com.ecommerce.platform.modules.catalog.entity.ProductVariant;
import com.ecommerce.platform.modules.catalog.repository.ProductVariantRepository;
import com.ecommerce.platform.modules.ordering.dto.OrderDto;
import com.ecommerce.platform.modules.ordering.entity.Cart;
import com.ecommerce.platform.modules.ordering.entity.CartItem;
import com.ecommerce.platform.modules.ordering.repository.CartItemRepository;
import com.ecommerce.platform.modules.ordering.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDto.CartDto getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return toCartDto(cart);
    }

    @Transactional
    public OrderDto.CartDto addToCart(Long userId, OrderDto.AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        ProductVariant variant = productVariantRepository.findByIdWithInventory(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        int available = variant.getInventory() != null ? variant.getInventory().getAvailableStock() : 0;
        if (available < request.getQuantity()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK, "Số lượng trong kho không đủ (" + available + " có sẵn)");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (available < newQuantity) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK, "Không thể thêm vượt quá tồn kho khả dụng (" + available + ")");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(item);
            cart.getItems().add(item);
        }

        return toCartDto(cart);
    }

    @Transactional
    public OrderDto.CartDto updateCartItem(Long userId, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY, "Mục giỏ hàng không tồn tại"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            int available = item.getVariant().getInventory() != null ? item.getVariant().getInventory().getAvailableStock() : 0;
            if (available < quantity) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK, "Số lượng yêu cầu vượt quá tồn kho khả dụng");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return toCartDto(cart);
    }

    @Transactional
    public OrderDto.CartDto removeCartItem(Long userId, Long itemId) {
        return updateCartItem(userId, itemId, 0);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            Cart newCart = Cart.builder().user(user).items(new ArrayList<>()).build();
            return cartRepository.save(newCart);
        });
    }

    private OrderDto.CartDto toCartDto(Cart cart) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;
        List<OrderDto.CartItemDto> itemDtos = new ArrayList<>();

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                ProductVariant v = item.getVariant();
                if (v == null) continue;

                BigDecimal price = v.getSalePrice() != null ? v.getSalePrice() : v.getPrice();
                BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
                totalAmount = totalAmount.add(subtotal);
                totalItems += item.getQuantity();

                int available = v.getInventory() != null ? v.getInventory().getAvailableStock() : 0;

                itemDtos.add(OrderDto.CartItemDto.builder()
                        .id(item.getId())
                        .variantId(v.getId())
                        .skuCode(v.getSkuCode())
                        .productName(v.getProduct() != null ? v.getProduct().getName() : "")
                        .productSlug(v.getProduct() != null ? v.getProduct().getSlug() : "")
                        .options(v.getOptions())
                        .imageUrl(v.getImageUrl())
                        .price(v.getPrice())
                        .salePrice(v.getSalePrice())
                        .quantity(item.getQuantity())
                        .subtotal(subtotal)
                        .availableStock(available)
                        .build());
            }
        }

        return OrderDto.CartDto.builder()
                .cartId(cart.getId())
                .items(itemDtos)
                .totalAmount(totalAmount)
                .totalItems(totalItems)
                .build();
    }
}
