package com.ecommerce.platform.modules.ordering.entity;

import com.ecommerce.platform.common.entity.BaseEntity;
import com.ecommerce.platform.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true, length = 60)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING";
    // PENDING -> CONFIRMED -> PACKING -> SHIPPING -> DELIVERED / CANCELLED / RETURNED

    @Column(name = "payment_method", nullable = false, length = 50)
    @Builder.Default
    private String paymentMethod = "COD"; // COD, VIETQR, VNPAY

    @Column(name = "payment_status", nullable = false, length = 50)
    @Builder.Default
    private String paymentStatus = "UNPAID"; // UNPAID, PAID, REFUNDED

    @Column(name = "payment_transaction_id", length = 150)
    private String paymentTransactionId;

    @Column(name = "total_product_amount", nullable = false)
    @Builder.Default
    private BigDecimal totalProductAmount = BigDecimal.ZERO;

    @Column(name = "shipping_fee", nullable = false)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", nullable = false)
    @Builder.Default
    private BigDecimal finalAmount = BigDecimal.ZERO;

    @Column(name = "shipping_carrier", length = 50)
    private String shippingCarrier; // GHN, GHTK

    @Column(name = "tracking_code", length = 100)
    private String trackingCode;

    /**
     * Stores full shipping address snapshot:
     * {"receiverName": "...", "phone": "...", "province": "...", "district": "...", "ward": "...", "detailAddress": "..."}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "shipping_address", columnDefinition = "jsonb", nullable = false)
    private String shippingAddress;

    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @Builder.Default
    private List<OrderTimeline> timelines = new ArrayList<>();
}
