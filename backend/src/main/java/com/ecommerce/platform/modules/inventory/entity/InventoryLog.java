package com.ecommerce.platform.modules.inventory.entity;

import com.ecommerce.platform.common.entity.BaseEntity;
import com.ecommerce.platform.modules.auth.entity.User;
import com.ecommerce.platform.modules.catalog.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(name = "change_type", nullable = false, length = 50)
    private String changeType; // IMPORT, ORDER_RESERVE, ORDER_COMMIT, ORDER_RELEASE, RETURN, ADJUSTMENT

    @Column(name = "quantity_changed", nullable = false)
    private Integer quantityChanged;

    @Column(name = "stock_on_hand_after", nullable = false)
    private Integer stockOnHandAfter;

    @Column(name = "stock_reserved_after", nullable = false)
    private Integer stockReservedAfter;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
