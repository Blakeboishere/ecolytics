package com.ecolutics.remnant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

/** One food or waste record, owned by the account that submitted it. */
@Entity
@Table(name = "remnant_entries", indexes = {
        @Index(name = "idx_remnant_owner_created", columnList = "owner_email, created_at")
})
public class RemnantEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_email", nullable = false, length = 254)
    private String ownerEmail;

    @Column(name = "weight_kg", nullable = false, precision = 10, scale = 2)
    // BigDecimal avoids floating-point rounding for a measured weight.
    private BigDecimal weightKg;

    @Column(name = "remnant_type", nullable = false, length = 16)
    private String remnantType;

    @Column(name = "item_name", nullable = false, length = 120)
    private String itemName;

    @Column(name = "category", nullable = false, length = 32)
    private String category;

    @Column(name = "meal_type", length = 16)
    // Waste entries have no meal type, so this field is intentionally optional.
    private String mealType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected RemnantEntry() {
    }

    public RemnantEntry(String ownerEmail, BigDecimal weightKg, String remnantType,
            String itemName, String category, String mealType) {
        this.ownerEmail = ownerEmail;
        this.weightKg = weightKg;
        this.remnantType = remnantType;
        this.itemName = itemName;
        this.category = category;
        this.mealType = mealType;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public String getRemnantType() {
        return remnantType;
    }

    public String getItemName() {
        return itemName;
    }

    public String getCategory() {
        return category;
    }

    public String getMealType() {
        return mealType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

}
