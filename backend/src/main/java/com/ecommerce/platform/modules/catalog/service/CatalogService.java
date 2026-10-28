package com.ecommerce.platform.modules.catalog.service;

import com.ecommerce.platform.common.exception.AppException;
import com.ecommerce.platform.common.exception.ErrorCode;
import com.ecommerce.platform.common.response.PageResponse;
import com.ecommerce.platform.modules.auth.entity.User;
import com.ecommerce.platform.modules.auth.repository.UserRepository;
import com.ecommerce.platform.modules.catalog.dto.CatalogDto;
import com.ecommerce.platform.modules.catalog.entity.Brand;
import com.ecommerce.platform.modules.catalog.entity.Category;
import com.ecommerce.platform.modules.catalog.entity.Product;
import com.ecommerce.platform.modules.catalog.entity.ProductReview;
import com.ecommerce.platform.modules.catalog.entity.ProductVariant;
import com.ecommerce.platform.modules.catalog.repository.BrandRepository;
import com.ecommerce.platform.modules.catalog.repository.CategoryRepository;
import com.ecommerce.platform.modules.catalog.repository.ProductRepository;
import com.ecommerce.platform.modules.catalog.repository.ProductReviewRepository;
import com.ecommerce.platform.modules.catalog.repository.ProductVariantRepository;
import com.ecommerce.platform.modules.inventory.entity.Inventory;
import com.ecommerce.platform.modules.inventory.entity.InventoryLog;
import com.ecommerce.platform.modules.inventory.repository.InventoryLogRepository;
import com.ecommerce.platform.modules.inventory.repository.InventoryRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductReviewRepository productReviewRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final UserRepository userRepository;

    // --- Category Management ---

    @Transactional(readOnly = true)
    public List<CatalogDto.CategoryDto> getCategoryTree() {
        List<Category> roots = categoryRepository.findRootCategoriesWithChildren();
        return roots.stream().map(this::toCategoryDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CatalogDto.BrandDto> getAllBrands() {
        return brandRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(b -> CatalogDto.BrandDto.builder()
                        .id(b.getId())
                        .name(b.getName())
                        .slug(b.getSlug())
                        .logoUrl(b.getLogoUrl())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CatalogDto.CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return toCategoryDto(category);
    }

    @Transactional
    public CatalogDto.CategoryDto createCategory(CatalogDto.CategoryDto request) {
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId()).orElse(null);
        }

        String slug = StringUtils.hasText(request.getSlug()) ? request.getSlug() : toSlug(request.getName());

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .iconUrl(request.getIconUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(true)
                .parent(parent)
                .attributeSchema(request.getAttributeSchema() != null ? request.getAttributeSchema() : "[]")
                .build();

        category = categoryRepository.save(category);
        return toCategoryDto(category);
    }

    // --- Dynamic Product Query & Filtering ---

    @Transactional(readOnly = true)
    public PageResponse<CatalogDto.ProductListItemDto> searchProducts(CatalogDto.ProductFilterRequest filter) {
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortBy = StringUtils.hasText(filter.getSortBy()) ? filter.getSortBy() : "id";
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), Sort.by(direction, sortBy));

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only ACTIVE products
            predicates.add(cb.equal(root.get("status"), "ACTIVE"));

            // Filter by Category slug
            if (StringUtils.hasText(filter.getCategorySlug())) {
                predicates.add(cb.equal(root.get("category").get("slug"), filter.getCategorySlug()));
            }

            // Filter by Category Id
            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));
            }

            // Filter by Brand Id
            if (filter.getBrandId() != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), filter.getBrandId()));
            }

            // Min Price
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("basePrice"), filter.getMinPrice()));
            }

            // Max Price
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("basePrice"), filter.getMaxPrice()));
            }

            // Min Rating
            if (filter.getMinRating() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("ratingAvg"), filter.getMinRating()));
            }

            // Keyword Search (Name or Description)
            if (StringUtils.hasText(filter.getKeyword())) {
                String searchPattern = "%" + filter.getKeyword().toLowerCase().trim() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("slug")), searchPattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> page = productRepository.findAll(spec, pageable);

        List<CatalogDto.ProductListItemDto> items = page.getContent().stream()
                .map(this::toProductListItemDto)
                .collect(Collectors.toList());

        return PageResponse.<CatalogDto.ProductListItemDto>builder()
                .items(items)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public CatalogDto.ProductDetailDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlugWithVariantsAndInventory(slug)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return toProductDetailDto(product);
    }

    // --- Product Admin Creation & Management ---

    @Transactional
    public CatalogDto.ProductDetailDto createProduct(CatalogDto.CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        Brand brand = null;
        if (request.getBrandId() != null) {
            brand = brandRepository.findById(request.getBrandId()).orElse(null);
        }

        String slug = StringUtils.hasText(request.getSlug()) ? request.getSlug() : toSlug(request.getName());

        Product product = Product.builder()
                .category(category)
                .brand(brand)
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .attributes(request.getAttributes() != null ? request.getAttributes() : "{}")
                .build();

        product = productRepository.save(product);

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<ProductVariant> variants = new ArrayList<>();
            for (CatalogDto.CreateVariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .skuCode(vr.getSkuCode())
                        .barcode(vr.getBarcode())
                        .price(vr.getPrice())
                        .salePrice(vr.getSalePrice())
                        .weightGrams(vr.getWeightGrams() != null ? vr.getWeightGrams() : 500)
                        .imageUrl(vr.getImageUrl())
                        .options(vr.getOptions() != null ? vr.getOptions() : "{}")
                        .build();

                variant = productVariantRepository.save(variant);

                // Initialize Inventory
                int initStock = vr.getInitialStock() != null ? vr.getInitialStock() : 0;
                Inventory inventory = Inventory.builder()
                        .variant(variant)
                        .stockOnHand(initStock)
                        .stockReserved(0)
                        .version(0L)
                        .build();
                inventoryRepository.save(inventory);

                if (initStock > 0) {
                    InventoryLog log = InventoryLog.builder()
                            .variant(variant)
                            .changeType("IMPORT")
                            .quantityChanged(initStock)
                            .stockOnHandAfter(initStock)
                            .stockReservedAfter(0)
                            .referenceType("INITIAL_STOCK")
                            .note("Khởi tạo sản phẩm mới")
                            .build();
                    inventoryLogRepository.save(log);
                }

                variants.add(variant);
            }
            product.setVariants(variants);
        }

        return toProductDetailDto(product);
    }

    // --- Reviews ---

    @Transactional(readOnly = true)
    public List<CatalogDto.ReviewDto> getProductReviews(Long productId) {
        return productReviewRepository.findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(productId).stream()
                .map(r -> CatalogDto.ReviewDto.builder()
                        .id(r.getId())
                        .userId(r.getUser().getId())
                        .userName(r.getUser().getFullName())
                        .userAvatar(r.getUser().getAvatarUrl())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .sellerReply(r.getSellerReply())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public CatalogDto.ReviewDto addReview(Long productId, Long userId, CatalogDto.CreateReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .isVisible(true)
                .build();

        review = productReviewRepository.save(review);

        // Update product average rating
        List<ProductReview> allReviews = productReviewRepository.findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(productId);
        double avg = allReviews.stream().mapToInt(ProductReview::getRating).average().orElse(5.0);
        product.setRatingAvg(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
        product.setReviewCount(allReviews.size());
        productRepository.save(product);

        return CatalogDto.ReviewDto.builder()
                .id(review.getId())
                .userId(user.getId())
                .userName(user.getFullName())
                .userAvatar(user.getAvatarUrl())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    // --- Helpers ---

    private CatalogDto.CategoryDto toCategoryDto(Category category) {
        List<CatalogDto.CategoryDto> childrenDtos = new ArrayList<>();
        if (category.getChildren() != null) {
            childrenDtos = category.getChildren().stream()
                    .filter(c -> Boolean.TRUE.equals(c.getIsActive()))
                    .map(this::toCategoryDto)
                    .collect(Collectors.toList());
        }

        return CatalogDto.CategoryDto.builder()
                .id(category.getId())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .name(category.getName())
                .slug(category.getSlug())
                .iconUrl(category.getIconUrl())
                .sortOrder(category.getSortOrder())
                .isActive(category.getIsActive())
                .attributeSchema(category.getAttributeSchema())
                .children(childrenDtos)
                .build();
    }

    private CatalogDto.ProductListItemDto toProductListItemDto(Product p) {
        BigDecimal minPrice = p.getBasePrice();
        BigDecimal maxPrice = p.getBasePrice();
        String mainImage = null;
        int totalStock = 0;

        if (p.getVariants() != null && !p.getVariants().isEmpty()) {
            List<BigDecimal> prices = p.getVariants().stream()
                    .map(v -> v.getSalePrice() != null ? v.getSalePrice() : v.getPrice())
                    .toList();
            minPrice = prices.stream().min(BigDecimal::compareTo).orElse(p.getBasePrice());
            maxPrice = prices.stream().max(BigDecimal::compareTo).orElse(p.getBasePrice());
            mainImage = p.getVariants().get(0).getImageUrl();

            totalStock = p.getVariants().stream()
                    .filter(v -> v.getInventory() != null)
                    .mapToInt(v -> v.getInventory().getAvailableStock())
                    .sum();
        }

        return CatalogDto.ProductListItemDto.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : "")
                .categorySlug(p.getCategory() != null ? p.getCategory().getSlug() : "")
                .brandName(p.getBrand() != null ? p.getBrand().getName() : "")
                .basePrice(p.getBasePrice())
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .ratingAvg(p.getRatingAvg())
                .reviewCount(p.getReviewCount())
                .mainImageUrl(mainImage)
                .totalStock(totalStock)
                .build();
    }

    private CatalogDto.ProductDetailDto toProductDetailDto(Product p) {
        List<CatalogDto.VariantDto> variantDtos = new ArrayList<>();
        if (p.getVariants() != null) {
            variantDtos = p.getVariants().stream().map(v -> {
                int onHand = v.getInventory() != null ? v.getInventory().getStockOnHand() : 0;
                int reserved = v.getInventory() != null ? v.getInventory().getStockReserved() : 0;
                return CatalogDto.VariantDto.builder()
                        .id(v.getId())
                        .skuCode(v.getSkuCode())
                        .barcode(v.getBarcode())
                        .price(v.getPrice())
                        .salePrice(v.getSalePrice())
                        .weightGrams(v.getWeightGrams())
                        .imageUrl(v.getImageUrl())
                        .options(v.getOptions())
                        .stockOnHand(onHand)
                        .stockReserved(reserved)
                        .availableStock(Math.max(0, onHand - reserved))
                        .build();
            }).collect(Collectors.toList());
        }

        CatalogDto.BrandDto brandDto = null;
        if (p.getBrand() != null) {
            brandDto = CatalogDto.BrandDto.builder()
                    .id(p.getBrand().getId())
                    .name(p.getBrand().getName())
                    .slug(p.getBrand().getSlug())
                    .logoUrl(p.getBrand().getLogoUrl())
                    .build();
        }

        CatalogDto.CategoryDto categoryDto = null;
        if (p.getCategory() != null) {
            categoryDto = CatalogDto.CategoryDto.builder()
                    .id(p.getCategory().getId())
                    .name(p.getCategory().getName())
                    .slug(p.getCategory().getSlug())
                    .attributeSchema(p.getCategory().getAttributeSchema())
                    .build();
        }

        return CatalogDto.ProductDetailDto.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .basePrice(p.getBasePrice())
                .status(p.getStatus())
                .ratingAvg(p.getRatingAvg())
                .reviewCount(p.getReviewCount())
                .category(categoryDto)
                .brand(brandDto)
                .attributes(p.getAttributes())
                .variants(variantDtos)
                .build();
    }

    private String toSlug(String input) {
        String nowhitespace = Pattern.compile("\\s+").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("[^a-z0-9-]", "").replaceAll("-+", "-");
    }
}
