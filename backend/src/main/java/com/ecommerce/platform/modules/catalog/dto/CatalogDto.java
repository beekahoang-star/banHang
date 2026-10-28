package com.ecommerce.platform.modules.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public class CatalogDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryDto {
        private Long id;
        private Long parentId;
        private String name;
        private String slug;
        private String iconUrl;
        private Integer sortOrder;
        private Boolean isActive;
        private String attributeSchema; // JSON Schema definition for this category
        private List<CategoryDto> children;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrandDto {
        private Long id;
        private String name;
        private String slug;
        private String logoUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantDto {
        private Long id;
        private String skuCode;
        private String barcode;
        private BigDecimal price;
        private BigDecimal salePrice;
        private Integer weightGrams;
        private String imageUrl;
        private String options; // JSON string e.g. {"color": "Đen", "size": "XL"}
        private Integer stockOnHand;
        private Integer stockReserved;
        private Integer availableStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductListItemDto {
        private Long id;
        private String name;
        private String slug;
        private String categoryName;
        private String categorySlug;
        private String brandName;
        private BigDecimal basePrice;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private BigDecimal ratingAvg;
        private Integer reviewCount;
        private String mainImageUrl;
        private Integer totalStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductDetailDto {
        private Long id;
        private String name;
        private String slug;
        private String description;
        private BigDecimal basePrice;
        private String status;
        private BigDecimal ratingAvg;
        private Integer reviewCount;
        private CategoryDto category;
        private BrandDto brand;
        private String attributes; // JSON string e.g. {"ram": "8GB", "cpu": "A17 Pro"}
        private List<VariantDto> variants;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProductRequest {
        @NotNull(message = "Danh mục không được để trống")
        private Long categoryId;

        private Long brandId;

        @NotBlank(message = "Tên sản phẩm không được để trống")
        private String name;

        private String slug;

        private String description;

        @NotNull(message = "Giá gốc không được để trống")
        @Positive(message = "Giá gốc phải lớn hơn 0")
        private BigDecimal basePrice;

        private String status = "ACTIVE";

        private String attributes; // JSON string of technical specs

        private List<CreateVariantRequest> variants;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateVariantRequest {
        @NotBlank(message = "Mã SKU không được để trống")
        private String skuCode;

        private String barcode;

        @NotNull(message = "Giá bán không được để trống")
        private BigDecimal price;

        private BigDecimal salePrice;

        private Integer weightGrams;

        private String imageUrl;

        private String options; // JSON string of variant options

        private Integer initialStock = 0;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductFilterRequest {
        private String categorySlug;
        private Long categoryId;
        private Long brandId;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private BigDecimal minRating;
        private String keyword;
        private Map<String, String> dynamicAttributes; // e.g. {"ram": "8GB"}
        private int page = 0;
        private int size = 12;
        private String sortBy = "id"; // id, price, ratingAvg
        private String sortDir = "desc";
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewDto {
        private Long id;
        private Long userId;
        private String userName;
        private String userAvatar;
        private Integer rating;
        private String comment;
        private String sellerReply;
        private Instant createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReviewRequest {
        @NotNull(message = "Vui lòng chọn số sao đánh giá (1-5)")
        private Integer rating;

        private String comment;
    }
}
