package com.ecolutics.remnant;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Expires food donation listings even when the browser is closed. */
@Service
public class RemnantExpiryService {

    private final RemnantEntryRepository entries;
    private final Duration donationWindow;

    public RemnantExpiryService(
            RemnantEntryRepository entries,
            @Value("${ecolytics.food-donation-window:PT8H}") Duration donationWindow) {
        this.entries = entries;
        this.donationWindow = donationWindow;
    }

    public Instant deadlineFrom(Instant createdAt) {
        return createdAt.plus(donationWindow);
    }

    /** Runs periodically and can also be called before listing entries for an immediate refresh. */
    @Scheduled(fixedDelayString = "${ecolytics.food-expiry-check-interval-ms:1000}")
    @Transactional
    public void expireOverdueFood() {
        List<RemnantEntry> missingDeadlines = entries.findAllByRemnantTypeAndDonationExpiresAtIsNull("food");
        if (!missingDeadlines.isEmpty()) {
            Instant deadline = deadlineFrom(Instant.now());
            missingDeadlines.forEach(entry -> entry.setDonationExpiresAt(deadline));
            entries.saveAll(missingDeadlines);
        }

        List<RemnantEntry> overdue = entries.findAllByRemnantTypeAndDonationExpiresAtLessThanEqual(
                "food", Instant.now());
        if (overdue.isEmpty()) {
            return;
        }
        overdue.forEach(RemnantEntry::moveExpiredFoodToWaste);
        entries.saveAll(overdue);
    }
}
