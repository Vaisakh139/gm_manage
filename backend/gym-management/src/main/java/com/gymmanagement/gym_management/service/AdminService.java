package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.admin.*;
import com.gymmanagement.gym_management.entity.*;
import com.gymmanagement.gym_management.exception.BusinessException;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.mapper.GymMapper;
import com.gymmanagement.gym_management.mapper.UserMapper;
import com.gymmanagement.gym_management.entity.EquipmentStatus;
import com.gymmanagement.gym_management.repository.EquipmentRepository;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final GymRepository gymRepository;
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final EquipmentRepository equipmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final GymMapper gymMapper;
    private final UserMapper userMapper;

    // ── Gyms ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GymResponse> getAllGyms() {
        List<GymResponse> gyms = gymRepository.findAll()
                .stream()
                .map(gymMapper::toGymResponse)
                .toList();
        log.debug("[ADMIN] Fetched all gyms | count={}", gyms.size());
        return gyms;
    }

    @Transactional
    public GymResponse createGym(GymRequest request) {
        if (userRepository.existsByEmail(request.getOwnerEmail())) {
            log.warn("[ADMIN] Create gym failed — email already in use: {}", request.getOwnerEmail());
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

        log.info("[ADMIN] Gym created | gymName='{}' ownerEmail={} gymId={}",
                gym.getGymName(), owner.getEmail(), gym.getId());

        return gymMapper.toGymResponse(gym);
    }

    @Transactional
    public GymResponse updateGym(Long gymId, GymRequest request) {
        Gym gym = findGym(gymId);
        String oldName = gym.getGymName();
        gym.setGymName(request.getGymName());
        gym.setAddress(request.getAddress());
        gym.setPhone(request.getPhone());
        GymResponse response = gymMapper.toGymResponse(gymRepository.save(gym));

        log.info("[ADMIN] Gym updated | gymId={} oldName='{}' newName='{}'",
                gymId, oldName, request.getGymName());

        return response;
    }

    @Transactional
    public void deleteGym(Long gymId) {
        Gym gym = findGym(gymId);
        log.info("[ADMIN] Gym deleted | gymId={} gymName='{}'", gymId, gym.getGymName());
        gymRepository.delete(gym);
    }

    // ── Users ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        List<UserResponse> users = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() != Role.ADMIN)
                .map(userMapper::toUserResponse)
                .toList();
        log.debug("[ADMIN] Fetched all users | count={}", users.size());
        return users;
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(active);
        UserResponse response = userMapper.toUserResponse(userRepository.save(user));

        log.info("[ADMIN] User status changed | userId={} email={} active={}",
                userId, user.getEmail(), active);

        return response;
    }

    // ── Dashboard ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalGyms(gymRepository.count())
                .totalGymOwners(userRepository.countByRole(Role.GYM_OWNER))
                .activeGymOwners(userRepository.countByRoleAndActiveTrue(Role.GYM_OWNER))
                .totalMembers(memberRepository.count())
                .activeMembers(memberRepository.countByStatus(MemberStatus.ACTIVE))
                .totalEquipments(equipmentRepository.count())
                .availableEquipments(equipmentRepository.countByStatus(EquipmentStatus.AVAILABLE))
                .equipmentsUnderMaintenance(equipmentRepository.countByStatus(EquipmentStatus.UNDER_MAINTENANCE))
                .build();

        log.debug("[ADMIN] Dashboard stats | gyms={} owners={} members={}",
                stats.getTotalGyms(), stats.getTotalGymOwners(), stats.getTotalMembers());

        return stats;
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
