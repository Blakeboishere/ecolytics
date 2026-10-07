package com.ecolutics.remnant;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Standard database operations for remnant entries plus an account-scoped history query. */
public interface RemnantEntryRepository extends JpaRepository<RemnantEntry, Long> {
    /** Spring Data filters by ownerEmail and sorts newest entries first from this method name. */
    List<RemnantEntry> findAllByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);
}
