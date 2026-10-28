package com.ecommerce.platform.modules.marketing.service;

import com.ecommerce.platform.common.exception.AppException;
import com.ecommerce.platform.common.exception.ErrorCode;
import com.ecommerce.platform.modules.marketing.dto.MarketingDto;
import com.ecommerce.platform.modules.marketing.entity.Banner;
import com.ecommerce.platform.modules.marketing.entity.FlashSale;
import com.ecommerce.platform.modules.marketing.entity.Voucher;
import com.ecommerce.platform.modules.marketing.repository.BannerRepository;
import com.ecommerce.platform.modules.marketing.repository.FlashSaleRepository;
import com.ecommerce.platform.modules.marketing.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketingService {

    private final VoucherRepository voucherRepository;
    private final FlashSaleRepository flashSaleRepository;
    private final BannerRepository bannerRepository;

    @Transactional(readOnly = true)
    public List<MarketingDto.BannerDto> getHomeBanners() {
        return bannerRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(b -> MarketingDto.BannerDto.builder()
                        .id(b.getId())
                        .title(b.getTitle())
                        .imageUrl(b.getImageUrl())
                        .linkUrl(b.getLinkUrl())
                        .position(b.getPosition())
                        .sortOrder(b.getSortOrder())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarketingDto.VoucherDto> getPublicVouchers() {
        return voucherRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toVoucherDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MarketingDto.VoucherValidationResult validateVoucher(MarketingDto.ValidateVoucherRequest request) {
        Voucher voucher = voucherRepository.findByCodeAndIsActiveTrue(request.getCode().trim().toUpperCase())
                .orElse(null);

        if (voucher == null) {
            return MarketingDto.VoucherValidationResult.builder()
                    .valid(false)
                    .message("Mã giảm giá không tồn tại hoặc đã hết hiệu lực")
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        Instant now = Instant.now();
        if (voucher.getStartDate().isAfter(now) || voucher.getEndDate().isBefore(now)) {
            return MarketingDto.VoucherValidationResult.builder()
                    .valid(false)
                    .message("Mã giảm giá chưa đến hạn hoặc đã hết thời gian áp dụng")
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            return MarketingDto.VoucherValidationResult.builder()
                    .valid(false)
                    .message("Mã giảm giá đã hết lượt sử dụng")
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        if (voucher.getMinOrderValue() != null && request.getTotalProductAmount().compareTo(voucher.getMinOrderValue()) < 0) {
            return MarketingDto.VoucherValidationResult.builder()
                    .valid(false)
                    .message("Đơn hàng chưa đạt giá trị tối thiểu " + voucher.getMinOrderValue().toPlainString() + "đ")
                    .discountAmount(BigDecimal.ZERO)
                    .build();
        }

        BigDecimal discount;
        if ("PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())) {
            discount = request.getTotalProductAmount().multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            discount = voucher.getDiscountValue();
        }

        return MarketingDto.VoucherValidationResult.builder()
                .valid(true)
                .code(voucher.getCode())
                .message("Áp dụng mã giảm giá thành công!")
                .discountAmount(discount)
                .build();
    }

    @Transactional(readOnly = true)
    public MarketingDto.FlashSaleDto getActiveFlashSale() {
        FlashSale flashSale = flashSaleRepository.findActiveFlashSale(Instant.now()).orElse(null);
        if (flashSale == null) return null;

        List<MarketingDto.FlashSaleItemDto> items = flashSale.getItems().stream().map(i -> {
            BigDecimal origPrice = i.getVariant().getPrice();
            int discountPercent = origPrice.compareTo(BigDecimal.ZERO) > 0
                    ? origPrice.subtract(i.getFlashPrice()).multiply(BigDecimal.valueOf(100)).divide(origPrice, 0, RoundingMode.HALF_UP).intValue()
                    : 0;

            return MarketingDto.FlashSaleItemDto.builder()
                    .variantId(i.getVariant().getId())
                    .skuCode(i.getVariant().getSkuCode())
                    .productName(i.getVariant().getProduct() != null ? i.getVariant().getProduct().getName() : "")
                    .productSlug(i.getVariant().getProduct() != null ? i.getVariant().getProduct().getSlug() : "")
                    .imageUrl(i.getVariant().getImageUrl())
                    .originalPrice(origPrice)
                    .flashPrice(i.getFlashPrice())
                    .quantityLimit(i.getQuantityLimit())
                    .soldCount(i.getSoldCount())
                    .discountPercent(discountPercent)
                    .build();
        }).collect(Collectors.toList());

        return MarketingDto.FlashSaleDto.builder()
                .id(flashSale.getId())
                .name(flashSale.getName())
                .startTime(flashSale.getStartTime())
                .endTime(flashSale.getEndTime())
                .items(items)
                .build();
    }

    @Transactional
    public MarketingDto.VoucherDto createVoucher(MarketingDto.CreateVoucherRequest request) {
        Voucher voucher = Voucher.builder()
                .code(request.getCode().trim().toUpperCase())
                .title(request.getTitle())
                .discountType(request.getDiscountType().toUpperCase())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 1000)
                .usedCount(0)
                .startDate(request.getStartDate() != null ? request.getStartDate() : Instant.now())
                .endDate(request.getEndDate() != null ? request.getEndDate() : Instant.now().plusSeconds(86400 * 30))
                .isActive(true)
                .build();

        voucher = voucherRepository.save(voucher);
        return toVoucherDto(voucher);
    }

    private MarketingDto.VoucherDto toVoucherDto(Voucher v) {
        return MarketingDto.VoucherDto.builder()
                .id(v.getId())
                .code(v.getCode())
                .title(v.getTitle())
                .discountType(v.getDiscountType())
                .discountValue(v.getDiscountValue())
                .minOrderValue(v.getMinOrderValue())
                .maxDiscountAmount(v.getMaxDiscountAmount())
                .usageLimit(v.getUsageLimit())
                .usedCount(v.getUsedCount())
                .startDate(v.getStartDate())
                .endDate(v.getEndDate())
                .isActive(v.getIsActive())
                .build();
    }
}
