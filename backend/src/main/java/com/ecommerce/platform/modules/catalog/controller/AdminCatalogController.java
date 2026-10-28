package com.ecommerce.platform.modules.catalog.controller;

import com.ecommerce.platform.common.response.ApiResponse;
import com.ecommerce.platform.modules.catalog.dto.CatalogDto;
import com.ecommerce.platform.modules.catalog.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/catalog")
@RequiredArgsConstructor
@Tag(name = "Admin Catalog API", description = "Quản lý danh mục, cấu hình attribute_schema, tạo sản phẩm SPU & sinh biến thể SKU")
public class AdminCatalogController {

    private final CatalogService catalogService;

    @PostMapping("/categories")
    @PreAuthorize("hasAuthority('CATALOG_WRITE') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Tạo mới danh mục kèm cấu hình attribute_schema JSON")
    public ResponseEntity<ApiResponse<CatalogDto.CategoryDto>> createCategory(@Valid @RequestBody CatalogDto.CategoryDto request) {
        CatalogDto.CategoryDto created = catalogService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo danh mục thành công", created));
    }

    @PostMapping("/products")
    @PreAuthorize("hasAuthority('CATALOG_WRITE') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Tạo sản phẩm SPU và ma trận biến thể SKU (Cartesian Product)")
    public ResponseEntity<ApiResponse<CatalogDto.ProductDetailDto>> createProduct(@Valid @RequestBody CatalogDto.CreateProductRequest request) {
        CatalogDto.ProductDetailDto created = catalogService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo sản phẩm và các biến thể thành công", created));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('CATALOG_WRITE') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Tải lên hình ảnh sản phẩm SPU / biến thể SKU")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProductImage(@RequestParam("file") MultipartFile file) {
        try {
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = "prod_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            Path targetPath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + filename;
            return ResponseEntity.ok(ApiResponse.ok("Tải ảnh lên thành công", Map.of("url", fileUrl, "filename", filename)));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("ERR_UPLOAD", "Không thể lưu hình ảnh: " + e.getMessage()));
        }
    }
}
