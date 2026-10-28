package com.ecommerce.platform.modules.catalog.controller;

import com.ecommerce.platform.common.response.ApiResponse;
import com.ecommerce.platform.common.response.PageResponse;
import com.ecommerce.platform.common.security.UserPrincipal;
import com.ecommerce.platform.modules.catalog.dto.CatalogDto;
import com.ecommerce.platform.modules.catalog.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/catalog")
@RequiredArgsConstructor
@Tag(name = "Public Catalog API", description = "Xem danh mục, tìm kiếm lọc động sản phẩm, chi tiết SPU & biến thể SKU")
public class PublicCatalogController {

    private final CatalogService catalogService;

    @GetMapping("/categories")
    @Operation(summary = "Lấy cây danh mục đa cấp kèm cấu hình attribute_schema")
    public ResponseEntity<ApiResponse<List<CatalogDto.CategoryDto>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getCategoryTree()));
    }

    @GetMapping("/categories/{slug}")
    @Operation(summary = "Lấy thông tin chi tiết một danh mục theo Slug")
    public ResponseEntity<ApiResponse<CatalogDto.CategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getCategoryBySlug(slug)));
    }

    @GetMapping("/brands")
    @Operation(summary = "Lấy danh sách các thương hiệu đang hoạt động")
    public ResponseEntity<ApiResponse<List<CatalogDto.BrandDto>>> getBrands() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getAllBrands()));
    }

    @PostMapping("/products/search")
    @Operation(summary = "Tìm kiếm và bộ lọc động sản phẩm (theo danh mục, khoảng giá, rating, JSONB specs)")
    public ResponseEntity<ApiResponse<PageResponse<CatalogDto.ProductListItemDto>>> searchProducts(
            @RequestBody CatalogDto.ProductFilterRequest filter) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.searchProducts(filter)));
    }

    @GetMapping("/products/{slug}")
    @Operation(summary = "Lấy chi tiết sản phẩm SPU kèm toàn bộ biến thể SKU và tồn kho khả dụng")
    public ResponseEntity<ApiResponse<CatalogDto.ProductDetailDto>> getProductDetail(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getProductBySlug(slug)));
    }

    @GetMapping("/products/{productId}/reviews")
    @Operation(summary = "Lấy danh sách đánh giá của sản phẩm")
    public ResponseEntity<ApiResponse<List<CatalogDto.ReviewDto>>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getProductReviews(productId)));
    }

    @PostMapping("/products/{productId}/reviews")
    @Operation(summary = "Gửi đánh giá cho sản phẩm (Cần đăng nhập)")
    public ResponseEntity<ApiResponse<CatalogDto.ReviewDto>> addReview(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CatalogDto.CreateReviewRequest request) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("ERR_401", "Vui lòng đăng nhập để gửi đánh giá"));
        }
        CatalogDto.ReviewDto review = catalogService.addReview(productId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Gửi đánh giá thành công", review));
    }
}
