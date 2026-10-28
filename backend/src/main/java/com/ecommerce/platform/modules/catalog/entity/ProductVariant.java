package com.ecommerce.platform.modules.catalog.entity;

import com.ecommerce.platform.common.entity.BaseEntity;
import com.ecommerce.platform.modules.inventory.entity.Inventory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "sku_code", nullable = false, unique = true, length = 100)
    private String skuCode;

    @Column(name = "barcode", length = 100)
    private String barcode;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Column(name = "weight_grams")
    @Builder.Default
    private Integer weightGrams = 500;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /**
     * Stores variant combination options:
     * e.g. {"color": "Titan Tự Nhiên", "storage": "256GB"}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options", columnDefinition = "jsonb")
    private String options;

    @OneToOne(mappedBy = "variant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Inventory inventory;
}
