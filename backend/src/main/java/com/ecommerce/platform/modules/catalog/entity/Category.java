package com.ecommerce.platform.modules.catalog.entity;

import com.ecommerce.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Category> children = new ArrayList<>();

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 180)
    private String slug;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Stores the dynamic attribute schema JSON for this category:
     * [
     *   {"key": "screen_size", "label": "Màn hình", "type": "select", "options": ["6.1 inch", "6.7 inch"]},
     *   {"key": "cpu", "label": "Vi xử lý", "type": "text"}
     * ]
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attribute_schema", columnDefinition = "jsonb")
    private String attributeSchema;
}
