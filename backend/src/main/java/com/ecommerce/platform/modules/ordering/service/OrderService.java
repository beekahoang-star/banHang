package com.ecommerce.platform.modules.ordering.service;

import com.ecommerce.platform.common.exception.AppException;
import com.ecommerce.platform.common.exception.ErrorCode;
import com.ecommerce.platform.common.response.PageResponse;
import com.ecommerce.platform.modules.auth.entity.User;
import com.ecommerce.platform.modules.auth.repository.UserRepository;
import com.ecommerce.platform.modules.catalog.entity.ProductVariant;
import com.ecommerce.platform.modules.catalog.repository.ProductVariantRepository;
import com.ecommerce.platform.modules.inventory.service.InventoryService;
import com.ecommerce.platform.modules.marketing.entity.Voucher;
import com.ecommerce.platform.modules.marketing.repository.VoucherRepository;
import com.ecommerce.platform.modules.ordering.dto.OrderDto;
import com.ecommerce.platform.modules.ordering.entity.Order;
import com.ecommerce.platform.modules.ordering.entity.OrderItem;
import com.ecommerce.platform.modules.ordering.entity.OrderTimeline;
import com.ecommerce.platform.modules.ordering.entity.RmaRequest;
import com.ecommerce.platform.modules.ordering.repository.OrderItemRepository;
import com.ecommerce.platform.modules.ordering.repository.OrderRepository;
import com.ecommerce.platform.modules.ordering.repository.OrderTimelineRepository;
import com.ecommerce.platform.modules.ordering.repository.RmaRequestRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderTimelineRepository orderTimelineRepository;
    private final RmaRequestRepository rmaRequestRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final OrderStateMachine orderStateMachine;
    private final VoucherRepository voucherRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public OrderDto.OrderResponse createOrder(Long userId, OrderDto.CreateOrderRequest request) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        String orderCode = generateOrderCode();
        BigDecimal totalProductAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .status("PENDING")
                .paymentMethod(StringUtils.hasText(request.getPaymentMethod()) ? request.getPaymentMethod().toUpperCase() : "COD")
                .paymentStatus("UNPAID")
                .shippingFee(new BigDecimal("30000")) // Standard shipping fee
                .discountAmount(BigDecimal.ZERO)
                .customerNote(request.getCustomerNote())
                .build();

        try {
            order.setShippingAddress(objectMapper.writeValueAsString(request.getShippingAddress()));
        } catch (Exception e) {
            order.setShippingAddress("{}");
        }

        // Process Items & Snapshot & Inventory Reservation
        for (OrderDto.OrderItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findByIdWithInventory(itemReq.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

            // Reserve stock (Anti-overselling Optimistic Locking)
            inventoryService.reserveStock(variant.getId(), itemReq.getQuantity(), orderCode);

            BigDecimal unitPrice = variant.getSalePrice() != null ? variant.getSalePrice() : variant.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalProductAmount = totalProductAmount.add(subtotal);

            // Freeze variant snapshot JSONB
            Map<String, Object> snapshot = new HashMap<>();
            snapshot.put("productName", variant.getProduct() != null ? variant.getProduct().getName() : "");
            snapshot.put("productSlug", variant.getProduct() != null ? variant.getProduct().getSlug() : "");
            snapshot.put("skuCode", variant.getSkuCode());
            snapshot.put("options", variant.getOptions());
            snapshot.put("imageUrl", variant.getImageUrl());
            snapshot.put("price", unitPrice);

            String snapshotJson;
            try {
                snapshotJson = objectMapper.writeValueAsString(snapshot);
            } catch (Exception e) {
                snapshotJson = "{}";
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .variantSnapshot(snapshotJson)
                    .build();

            orderItems.add(orderItem);
        }

        order.setTotalProductAmount(totalProductAmount);

        // Apply Voucher if provided
        BigDecimal discount = BigDecimal.ZERO;
        if (StringUtils.hasText(request.getVoucherCode())) {
            Optional<Voucher> voucherOpt = voucherRepository.findByCodeAndIsActiveTrue(request.getVoucherCode().trim().toUpperCase());
            if (voucherOpt.isPresent()) {
                Voucher voucher = voucherOpt.get();
                if (voucher.getMinOrderValue() == null || totalProductAmount.compareTo(voucher.getMinOrderValue()) >= 0) {
                    if ("PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())) {
                        discount = totalProductAmount.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100));
                        if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                            discount = voucher.getMaxDiscountAmount();
                        }
                    } else {
                        discount = voucher.getDiscountValue();
                    }
                    voucher.setUsedCount((voucher.getUsedCount() != null ? voucher.getUsedCount() : 0) + 1);
                    voucherRepository.save(voucher);
                }
            }
        }

        order.setDiscountAmount(discount);
        BigDecimal finalAmount = totalProductAmount.add(order.getShippingFee()).subtract(discount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }
        order.setFinalAmount(finalAmount);
        order.setItems(orderItems);

        order = orderRepository.save(order);

        // Record Initial Timeline
        OrderTimeline initialTimeline = OrderTimeline.builder()
                .order(order)
                .fromStatus(null)
                .toStatus("PENDING")
                .changedBy(user)
                .note("Đơn hàng được khởi tạo thành công, chờ xác nhận.")
                .build();
        orderTimelineRepository.save(initialTimeline);

        return toOrderResponse(order);
    }

    /**
     * Order State Machine Transition handler
     */
    @Transactional
    public OrderDto.OrderResponse updateOrderStatus(Long orderId, OrderDto.UpdateOrderStatusRequest request, Long changedByUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        String currentStatus = order.getStatus();
        String targetStatus = request.getNewStatus().toUpperCase();

        // 1. Validate State Machine
        orderStateMachine.validateTransition(currentStatus, targetStatus);

        User changedBy = changedByUserId != null ? userRepository.findById(changedByUserId).orElse(null) : null;

        // 2. Inventory Side Effects based on transitions
        if ("SHIPPING".equalsIgnoreCase(targetStatus) || "DELIVERED".equalsIgnoreCase(targetStatus)) {
            // Commit stock if moving to SHIPPING from earlier state
            if ("PACKING".equalsIgnoreCase(currentStatus) || "CONFIRMED".equalsIgnoreCase(currentStatus) || "PENDING".equalsIgnoreCase(currentStatus)) {
                for (OrderItem item : order.getItems()) {
                    if (item.getVariant() != null) {
                        inventoryService.commitStock(item.getVariant().getId(), item.getQuantity(), order.getOrderCode());
                    }
                }
            }
        } else if ("CANCELLED".equalsIgnoreCase(targetStatus)) {
            // If cancelled before shipping, release reserved stock
            if (!"SHIPPING".equalsIgnoreCase(currentStatus) && !"DELIVERED".equalsIgnoreCase(currentStatus)) {
                for (OrderItem item : order.getItems()) {
                    if (item.getVariant() != null) {
                        inventoryService.releaseStock(item.getVariant().getId(), item.getQuantity(), order.getOrderCode());
                    }
                }
            }
            order.setCancelReason(request.getCancelReason() != null ? request.getCancelReason() : "Hủy theo yêu cầu");
        } else if ("RETURNED".equalsIgnoreCase(targetStatus)) {
            // If returned, add items back to on_hand stock
            for (OrderItem item : order.getItems()) {
                if (item.getVariant() != null) {
                    inventoryService.restock(
                            new com.ecommerce.platform.modules.inventory.dto.InventoryDto.RestockRequest(
                                    item.getVariant().getId(), item.getQuantity(), "Hoàn kho đơn hàng hoàn trả " + order.getOrderCode()),
                            changedByUserId
                    );
                }
            }
        }

        if (StringUtils.hasText(request.getShippingCarrier())) {
            order.setShippingCarrier(request.getShippingCarrier());
        }
        if (StringUtils.hasText(request.getTrackingCode())) {
            order.setTrackingCode(request.getTrackingCode());
        }

        order.setStatus(targetStatus);
        order = orderRepository.save(order);

        // Record Timeline entry
        OrderTimeline timeline = OrderTimeline.builder()
                .order(order)
                .fromStatus(currentStatus)
                .toStatus(targetStatus)
                .changedBy(changedBy)
                .note(request.getNote() != null ? request.getNote() : "Chuyển trạng thái đơn sang " + targetStatus)
                .build();
        orderTimelineRepository.save(timeline);

        return toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderDto.OrderResponse> getCustomerOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<OrderDto.OrderResponse> items = orderPage.getContent().stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());

        return PageResponse.<OrderDto.OrderResponse>builder()
                .items(items)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderDto.OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<OrderDto.OrderResponse> items = orderPage.getContent().stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());

        return PageResponse.<OrderDto.OrderResponse>builder()
                .items(items)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCodeWithItems(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return toOrderResponse(order);
    }

    // --- RMA (Return Merchandise Authorization) ---

    @Transactional
    public OrderDto.RmaResponse createRma(Long userId, OrderDto.CreateRmaRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String imagesJson = "[]";
        if (request.getImages() != null) {
            try {
                imagesJson = objectMapper.writeValueAsString(request.getImages());
            } catch (Exception ignored) {}
        }

        RmaRequest rma = RmaRequest.builder()
                .order(order)
                .user(user)
                .status("PENDING")
                .reason(request.getReason())
                .refundAmount(order.getFinalAmount())
                .images(imagesJson)
                .build();

        rma = rmaRequestRepository.save(rma);

        return OrderDto.RmaResponse.builder()
                .id(rma.getId())
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .status(rma.getStatus())
                .reason(rma.getReason())
                .refundAmount(rma.getRefundAmount())
                .images(rma.getImages())
                .createdAt(rma.getCreatedAt())
                .build();
    }

    // --- Helpers ---

    private OrderDto.OrderResponse toOrderResponse(Order order) {
        OrderDto.ShippingAddressDto addressDto = null;
        try {
            if (StringUtils.hasText(order.getShippingAddress())) {
                addressDto = objectMapper.readValue(order.getShippingAddress(), OrderDto.ShippingAddressDto.class);
            }
        } catch (Exception ignored) {}

        List<OrderDto.OrderItemResponse> itemResponses = order.getItems().stream()
                .map(i -> OrderDto.OrderItemResponse.builder()
                        .id(i.getId())
                        .variantId(i.getVariant() != null ? i.getVariant().getId() : null)
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .variantSnapshot(i.getVariantSnapshot())
                        .build())
                .collect(Collectors.toList());

        List<OrderDto.TimelineResponse> timelineResponses = order.getTimelines().stream()
                .map(t -> OrderDto.TimelineResponse.builder()
                        .fromStatus(t.getFromStatus())
                        .toStatus(t.getToStatus())
                        .changedByName(t.getChangedBy() != null ? t.getChangedBy().getFullName() : "Hệ thống")
                        .note(t.getNote())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .customerName(order.getUser() != null ? order.getUser().getFullName() : (addressDto != null ? addressDto.getReceiverName() : "Khách vãng lai"))
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : "N/A")
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .paymentTransactionId(order.getPaymentTransactionId())
                .totalProductAmount(order.getTotalProductAmount())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .shippingCarrier(order.getShippingCarrier())
                .trackingCode(order.getTrackingCode())
                .shippingAddress(addressDto)
                .customerNote(order.getCustomerNote())
                .cancelReason(order.getCancelReason())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .timelines(timelineResponses)
                .build();
    }

    private String generateOrderCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmm"));
        int random = 1000 + new Random().nextInt(9000);
        return "ORD-" + timestamp + "-" + random;
    }
}
