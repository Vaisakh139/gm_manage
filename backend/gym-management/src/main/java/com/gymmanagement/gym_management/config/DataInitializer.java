package com.gymmanagement.gym_management.config;

import com.gymmanagement.gym_management.entity.Role;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@gym.com")) return;

        User admin = User.builder()
                .name("System Admin")
                .email("admin@gym.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .passwordChanged(true)   // admin doesn't need to change password
                .active(true)
                .build();
        userRepository.save(admin);

        log.info("✅ Default admin created → admin@gym.com / admin123");
    }
}
