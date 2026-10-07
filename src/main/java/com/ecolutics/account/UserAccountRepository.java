package com.ecolutics.account;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** Database queries for accounts; Spring Data implements these methods from their names. */
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
