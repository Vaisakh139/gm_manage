package com.gymmanagement.gym_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Main entry point for GymPro Management System.
 *
 * @EntityScan is scoped explicitly to the 'entity' package so that legacy
 * stub classes in the 'model' package are never evaluated by Hibernate —
 * regardless of which build tool (Maven / IntelliJ / Eclipse) produced the
 * classpath artifacts.
 *
 * @EnableJpaRepositories is scoped to 'repository' so Spring Data never
 * attempts to instantiate the empty package-private legacy stubs.
 */
@SpringBootApplication
@EntityScan("com.gymmanagement.gym_management.entity")
@EnableJpaRepositories("com.gymmanagement.gym_management.repository")
public class GymManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(GymManagementApplication.class, args);
    }
}
