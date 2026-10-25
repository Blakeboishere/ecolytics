
package com.ecolutics.remnant;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RemnantExpiryService {

    private final RemnantEntryRepository entries;

    public RemnantExpiryService(RemnantEntryRepository entries) {
        this.entries = entries;
    }

    private Duration getDonationWindow(String category) {
        if (category == null) {
            throw new IllegalArgumentException(
                    "Food category cannot be null"
            );
        }

        return switch (category.toLowerCase(Locale.ROOT)) {
            case "raw" -> Duration.ofHours(8);
            case "cooked" -> Duration.ofHours(2);
            case "packed" -> Duration.ofHours(6);
            default -> throw new IllegalArgumentException(
                    "Unknown food category: " + category
            );
        };
    }

    public Instant deadlineFrom(Instant createdAt, String category) {
        return createdAt.plus(getDonationWindow(category));
    }

    /**
     * Expires food donation listings even when the browser is closed.
     */
    @Scheduled(
            fixedDelayString =
                    "${ecolytics.food-expiry-check-interval-ms:1000}"
    )
    @Transactional
    public void expireOverdueFood() {

        // Assign deadlines to older food entries that don't have one.
        List<RemnantEntry> missingDeadlines =
                entries.findAllByRemnantTypeAndDonationExpiresAtIsNull(
                        "food"
                );

        for (RemnantEntry entry : missingDeadlines) {
            Instant createdAt = entry.getCreatedAt();

            if (createdAt != null) {
                entry.setDonationExpiresAt(
                        deadlineFrom(createdAt, entry.getCategory())
                );
            }
        }

        if (!missingDeadlines.isEmpty()) {
            entries.saveAll(missingDeadlines);
        }

        // Move food entries to waste when their deadlines have passed.
        List<RemnantEntry> overdue =
                entries.findAllByRemnantTypeAndDonationExpiresAtLessThanEqual(
                        "food",
                        Instant.now()
                );

        if (overdue.isEmpty()) {
            return;
        }

        overdue.forEach(RemnantEntry::moveExpiredFoodToWaste);
        entries.saveAll(overdue);
    }
}
