package com.ecolutics.account;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Defines the password hashing service injected into account operations. */
@Configuration
public class PasswordConfiguration {

    /** BCrypt stores a one-way hash, so the original password is not kept in the database. */
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
