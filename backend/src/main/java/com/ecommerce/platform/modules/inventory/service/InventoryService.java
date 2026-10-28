package com.ecommerce.platform.modules.inventory.service;

import com.ecommerce.platform.common.exception.AppException;
import com.ecommerce.platform.common.exception.ErrorCode;
import com.ecommerce.platform.modules.auth.entity.User;
import com.ecommerce.platform.modules.auth.repository.UserRepository;
import com.ecommerce.platform.modules.catalog.entity.ProductVariant;
import com.ecommerce.platform.modules.catalog.repository.ProductVariantRepository;
import com.ecommerce.platform.modules.inventory.dto.InventoryDto;
import com.ecommerce.platform.modules.inventory.entity.Inventory;
import com.ecommerce.platform.modules.inventory.entity.InventoryLog;
import com.ecommerce.platform.modules.inventory.repository.InventoryLogRepository;
import com.ecommerce.platform.modules.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<InventoryDto.InventorySummaryDto> getAllInventories() {
        return inventoryRepository.findAll().stream()
                .map(this::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryDto.InventoryLogDto> getRecentLogs() {
        return inventoryLogRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(this::toLogDto)
                .collect(Collectors.toList());
    }

    /**
     * Chống bán lố (Overselling prevention) bằng Optimistic Locking (@Version)
     * Giữ hàng (Reserve) cho đơn hàng mới tạo
     */
    @Transactional
    public void reserveStock(Long variantId, int quantity, String orderCode) {
        try {
            Inventory inventory = inventoryRepository.findById(variantId)
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

            if (inventory.getAvailableStock() < quantity) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
                        "Mã SKU " + inventory.getVariant().getSkuCode() + " không đủ tồn kho (Còn lại: " + inventory.getAvailableStock() + ")");
            }

            inventory.setStockReserved(inventory.getStockReserved() + quantity);
            inventoryRepository.save(inventory);

            InventoryLog logEntry = InventoryLog.builder()
                    .variant(inventory.getVariant())
                    .changeType("ORDER_RESERVE")
                    .quantityChanged(quantity)
                    .stockOnHandAfter(inventory.getStockOnHand())
                    .stockReservedAfter(inventory.getStockReserved())
                    .referenceType("ORDER")
                    .referenceId(orderCode)
                    .note("Giữ hàng cho đơn hàng " + orderCode)
                    .build();
            inventoryLogRepository.save(logEntry);

            log.info("Reserved {} units for variant {} in order {}", quantity, variantId, orderCode);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new AppException(ErrorCode.OPTIMISTIC_LOCK_CONFLICT);
        }
    }

    /**
     * Xác nhận xuất kho (Commit) khi đơn hàng chuyển sang giao hàng
     */
    @Transactional
    public void commitStock(Long variantId, int quantity, String orderCode) {
        Inventory inventory = inventoryRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        inventory.setStockOnHand(Math.max(0, inventory.getStockOnHand() - quantity));
        inventory.setStockReserved(Math.max(0, inventory.getStockReserved() - quantity));
        inventoryRepository.save(inventory);

        InventoryLog logEntry = InventoryLog.builder()
                .variant(inventory.getVariant())
                .changeType("ORDER_COMMIT")
                .quantityChanged(-quantity)
                .stockOnHandAfter(inventory.getStockOnHand())
                .stockReservedAfter(inventory.getStockReserved())
                .referenceType("ORDER")
                .referenceId(orderCode)
                .note("Đã xuất kho gửi vận chuyển cho đơn " + orderCode)
                .build();
        inventoryLogRepository.save(logEntry);
    }

    /**
     * Giải phóng tồn kho giữ (Release) khi đơn hàng bị hủy
     */
    @Transactional
    public void releaseStock(Long variantId, int quantity, String orderCode) {
        Inventory inventory = inventoryRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        inventory.setStockReserved(Math.max(0, inventory.getStockReserved() - quantity));
        inventoryRepository.save(inventory);

        InventoryLog logEntry = InventoryLog.builder()
                .variant(inventory.getVariant())
                .changeType("ORDER_RELEASE")
                .quantityChanged(quantity)
                .stockOnHandAfter(inventory.getStockOnHand())
                .stockReservedAfter(inventory.getStockReserved())
                .referenceType("ORDER")
                .referenceId(orderCode)
                .note("Giải phóng tồn giữ do hủy đơn " + orderCode)
                .build();
        inventoryLogRepository.save(logEntry);
    }

    /**
     * Nhập thêm hàng vào kho (Restock / Import)
     */
    @Transactional
    public InventoryDto.InventorySummaryDto restock(InventoryDto.RestockRequest request, Long userId) {
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        Inventory inventory = inventoryRepository.findById(request.getVariantId())
                .orElseGet(() -> Inventory.builder()
                        .variant(variant)
                        .stockOnHand(0)
                        .stockReserved(0)
                        .version(0L)
                        .build());

        inventory.setStockOnHand(inventory.getStockOnHand() + request.getQuantity());
        inventory = inventoryRepository.save(inventory);

        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        InventoryLog logEntry = InventoryLog.builder()
                .variant(variant)
                .changeType("IMPORT")
                .quantityChanged(request.getQuantity())
                .stockOnHandAfter(inventory.getStockOnHand())
                .stockReservedAfter(inventory.getStockReserved())
                .referenceType("IMPORT_RECEIPT")
                .note(request.getNote() != null ? request.getNote() : "Nhập hàng bổ sung")
                .createdBy(user)
                .build();
        inventoryLogRepository.save(logEntry);

        return toSummaryDto(inventory);
    }

    /**
     * Kiểm kê & điều chỉnh tồn kho (Stock Adjustment)
     */
    @Transactional
    public InventoryDto.InventorySummaryDto adjustStock(InventoryDto.AdjustStockRequest request, Long userId) {
        Inventory inventory = inventoryRepository.findById(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        int diff = request.getNewStockOnHand() - inventory.getStockOnHand();
        inventory.setStockOnHand(request.getNewStockOnHand());
        inventory = inventoryRepository.save(inventory);

        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        InventoryLog logEntry = InventoryLog.builder()
                .variant(inventory.getVariant())
                .changeType("ADJUSTMENT")
                .quantityChanged(diff)
                .stockOnHandAfter(inventory.getStockOnHand())
                .stockReservedAfter(inventory.getStockReserved())
                .referenceType("STOCK_AUDIT")
                .note(request.getNote() != null ? request.getNote() : "Điều chỉnh sau kiểm kê kho")
                .createdBy(user)
                .build();
        inventoryLogRepository.save(logEntry);

        return toSummaryDto(inventory);
    }

    private InventoryDto.InventorySummaryDto toSummaryDto(Inventory i) {
        ProductVariant v = i.getVariant();
        return InventoryDto.InventorySummaryDto.builder()
                .variantId(i.getVariantId())
                .skuCode(v != null ? v.getSkuCode() : "N/A")
                .productName(v != null && v.getProduct() != null ? v.getProduct().getName() : "N/A")
                .options(v != null ? v.getOptions() : "{}")
                .price(v != null ? v.getPrice() : null)
                .stockOnHand(i.getStockOnHand())
                .stockReserved(i.getStockReserved())
                .availableStock(i.getAvailableStock())
                .version(i.getVersion())
                .build();
    }

    private InventoryDto.InventoryLogDto toLogDto(InventoryLog l) {
        return InventoryDto.InventoryLogDto.builder()
                .id(l.getId())
                .variantId(l.getVariant().getId())
                .skuCode(l.getVariant().getSkuCode())
                .changeType(l.getChangeType())
                .quantityChanged(l.getQuantityChanged())
                .stockOnHandAfter(l.getStockOnHandAfter())
                .stockReservedAfter(l.getStockReservedAfter())
                .referenceType(l.getReferenceType())
                .referenceId(l.getReferenceId())
                .note(l.getNote())
                .createdByName(l.getCreatedBy() != null ? l.getCreatedBy().getFullName() : "Hệ thống")
                .createdAt(l.getCreatedAt())
                .build();
    }
}
