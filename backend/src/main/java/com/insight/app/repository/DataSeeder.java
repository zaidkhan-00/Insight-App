package com.insight.app.repository;

import java.time.Instant;
import java.util.UUID;

import com.insight.app.model.User;
import com.insight.app.service.PasswordHasher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds demo data on first run (empty tables), mirroring the old JSON-file
 * first-run seeding so the app is immediately usable.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final AuthRepository users;
    private final SignalRepository threads;
    private final MessageRepository messages;

    public DataSeeder(AuthRepository users, SignalRepository threads, MessageRepository messages) {
        this.users = users;
        this.threads = threads;
        this.messages = messages;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() == 0) {
            String salt = PasswordHasher.newSalt();
            User demo = new User(
                    "u-demo000",
                    "demo@insight.app",
                    "Demo User",
                    PasswordHasher.hash("insight123", salt),
                    salt,
                    Instant.now());
            users.save(demo);
            log.info("Seeded demo account: demo@insight.app / insight123");
        }

        if (threads.count() == 0) {
            SeedData.seed().forEach(threads::save);
            log.info("Seeded {} threads", threads.count());
        }

        if (messages.count() == 0) {
            SeedMessages.seed().forEach(messages::save);
            log.info("Seeded {} messages", messages.count());
        }
    }
}