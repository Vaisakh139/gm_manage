package com.gymmanagement.gym_management.repository;

import com.gymmanagement.gym_management.entity.Role;
import com.gymmanagement.gym_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    long countByRole(Role role);
    long countByRoleAndActiveTrue(Role role);
}
