package com.gymmanagement.gym_management.config;

import com.gymmanagement.gym_management.model.*;
import com.gymmanagement.gym_management.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MembershipPlanRepository planRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@gym.com")) {
            return;
        }

        // Create admin user
        User admin = User.builder()
                .email("admin@gym.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);

        // Create sample plans
        planRepository.save(MembershipPlan.builder()
                .name("Basic").description("Access to gym floor").durationMonths(1)
                .price(new BigDecimal("29.99")).active(true).build());
        planRepository.save(MembershipPlan.builder()
                .name("Standard").description("Gym + group classes").durationMonths(3)
                .price(new BigDecimal("79.99")).active(true).build());
        planRepository.save(MembershipPlan.builder()
                .name("Premium").description("All access + personal trainer").durationMonths(6)
                .price(new BigDecimal("149.99")).active(true).build());

        log.info("Default admin created: admin@gym.com / admin123");
    }
}
