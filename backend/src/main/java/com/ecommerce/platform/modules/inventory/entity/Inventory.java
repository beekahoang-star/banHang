package com.ecommerce.platform.modules.inventory.entity;

import com.ecommerce.platform.common.entity.BaseEntity;
import com.ecommerce.platform.modules.catalog.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory extends BaseEntity {

    @Id
    @Column(name = "variant_id")
    private Long variantId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(name = "stock_on_hand", nullable = false)
    @Builder.Default
    private Integer stockOnHand = 0;

    @Column(name = "stock_reserved", nullable = false)
    @Builder.Default
    private Integer stockReserved = 0;

    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    public int getAvailableStock() {
        return Math.max(0, (stockOnHand != null ? stockOnHand : 0) - (stockReserved != null ? stockReserved : 0));
    }
}
