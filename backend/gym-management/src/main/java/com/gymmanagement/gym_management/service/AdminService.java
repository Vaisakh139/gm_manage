package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.admin.*;
import com.gymmanagement.gym_management.entity.*;
import com.gymmanagement.gym_management.exception.BusinessException;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.mapper.GymMapper;
import com.gymmanagement.gym_management.mapper.UserMapper;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final GymRepository gymRepository;
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ── Injected MapStruct mappers ────────────────────────────
    private final GymMapper gymMapper;
    private final UserMapper userMapper;

    // ── Gyms ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GymResponse> getAllGyms() {
        return gymRepository.findAll()
                .stream()
                .map(gymMapper::toGymResponse)
                .toList();
    }

    /** Create gym + GYM_OWNER account with a temporary password, then send a welcome email */
    @Transactional
    public GymResponse createGym(GymRequest request) {
        if (userRepository.existsByEmail(request.getOwnerEmail())) {
            throw new BusinessException("Email already in use: " + request.getOwnerEmail());
        }

        String tempPassword = generateTempPassword();

        User owner = User.builder()
                .name(request.getOwnerName())
                .email(request.getOwnerEmail())
                .phone(request.getOwnerPhone())
                .password(passwordEncoder.encode(tempPassword))
                .role(Role.GYM_OWNER)
                .passwordChanged(false)
                .active(true)
                .build();
        userRepository.save(owner);

        Gym gym = Gym.builder()
                .gymName(request.getGymName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .owner(owner)
                .build();
        gym = gymRepository.save(gym);

        emailService.sendWelcomeEmail(owner.getEmail(), owner.getName(), tempPassword);

        return gymMapper.toGymResponse(gym);
    }

    @Transactional
    public GymResponse updateGym(Long gymId, GymRequest request) {
        Gym gym = findGym(gymId);
        gym.setGymName(request.getGymName());
        gym.setAddress(request.getAddress());
        gym.setPhone(request.getPhone());
        return gymMapper.toGymResponse(gymRepository.save(gym));
    }

    @Transactional
    public void deleteGym(Long gymId) {
        gymRepository.delete(findGym(gymId));
    }

    // ── Users ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() != Role.ADMIN)
                .map(userMapper::toUserResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(active);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    // ── Dashboard ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        return DashboardStatsResponse.builder()
                .totalGyms(gymRepository.count())
                .totalGymOwners(userRepository.countByRole(Role.GYM_OWNER))
                .activeGymOwners(userRepository.countByRoleAndActiveTrue(Role.GYM_OWNER))
                .totalMembers(memberRepository.count())
                .activeMembers(memberRepository.countByStatus(MemberStatus.ACTIVE))
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────

    private Gym findGym(Long id) {
        return gymRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found with id: " + id));
    }

    private String generateTempPassword() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }
}
