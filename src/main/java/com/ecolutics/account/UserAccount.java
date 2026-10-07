package com.ecolutics.account;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import java.time.Instant;

@Entity
@Table(name = "user_accounts")
/** Database representation of a registered user. */
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 120)
    private String organization;

    @Column(length = 120)
    private String location;

    // Nullable to let Hibernate add this field to existing project databases without losing rows.
    @Column(name = "created_at")
    private Instant createdAt;

    @Column(nullable = false)
    private String passwordHash;

    protected UserAccount() {
    }

    public UserAccount(String fullName, String email, String passwordHash) {
        this(fullName, email, passwordHash, null, null, null);
    }

    public UserAccount(String fullName, String email, String passwordHash,
            String phone, String organization, String location) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.organization = organization;
        this.location = location;
        this.createdAt = Instant.now();
    }

    @PrePersist
    private void setCreationTimeIfMissing() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public void updateProfile(String phone, String organization, String location) {
        this.phone = phone;
        this.organization = organization;
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getOrganization() {
        return organization;
    }

    public String getLocation() {
        return location;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
}
