package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.PageResponse;
import com.gymmanagement.gym_management.dto.gymowner.*;
import com.gymmanagement.gym_management.entity.*;
import com.gymmanagement.gym_management.exception.BusinessException;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GymOwnerService {

    private final GymRepository gymRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ── Gym ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Gym getGymByOwner(Long ownerId) {
        return gymRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));
    }

    @Transactional
    public Gym updateGym(Long ownerId, String gymName, String address, String phone) {
        Gym gym = getGymByOwner(ownerId);
        gym.setGymName(gymName);
        gym.setAddress(address);
        gym.setPhone(phone);
        return gymRepository.save(gym);
    }

    // ── Dashboard ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public GymOwnerDashboardResponse getDashboard(Long ownerId) {
        Gym gym = getGymByOwner(ownerId);
        return GymOwnerDashboardResponse.builder()
                .gymName(gym.getGymName())
                .totalMembers(memberRepository.countByGymId(gym.getId()))
                .activeMembers(memberRepository.countByGymIdAndStatus(gym.getId(), MemberStatus.ACTIVE))
                .inactiveMembers(memberRepository.countByGymIdAndStatus(gym.getId(), MemberStatus.INACTIVE))
                .expiredMembers(memberRepository.countByGymIdAndStatus(gym.getId(), MemberStatus.EXPIRED))
                .build();
    }

    // ── Members ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<MemberResponse> getMembers(Long ownerId, String search, int page, int size) {
        Gym gym = getGymByOwner(ownerId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var memberPage = memberRepository.findByGymIdAndSearch(gym.getId(), search, pageable);
        return PageResponse.from(memberPage.map(this::toMemberResponse));
    }

    @Transactional(readOnly = true)
    public MemberResponse getMember(Long ownerId, Long memberId) {
        Gym gym = getGymByOwner(ownerId);
        Member member = findMember(memberId);
        if (!member.getGym().getId().equals(gym.getId())) {
            throw new BusinessException("Member does not belong to your gym");
        }
        return toMemberResponse(member);
    }

    /** Add a new member — creates a User account + sends welcome email */
    @Transactional
    public MemberResponse addMember(Long ownerId, MemberRequest request) {
        Gym gym = getGymByOwner(ownerId);
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail());
        }

        String tempPassword = generateTempPassword();
        User user = User.builder()
                .name(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(tempPassword))
                .role(Role.MEMBER)
                .passwordChanged(false)
                .active(true)
                .build();
        userRepository.save(user);

        Member member = Member.builder()
                .gym(gym)
                .user(user)
                .membershipPlan(request.getMembershipPlan())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : MemberStatus.ACTIVE)
                .build();
        member = memberRepository.save(member);

        emailService.sendWelcomeEmail(user.getEmail(), user.getName(), tempPassword);
        return toMemberResponse(member);
    }

    @Transactional
    public MemberResponse updateMember(Long ownerId, Long memberId, MemberRequest request) {
        Gym gym = getGymByOwner(ownerId);
        Member member = findMember(memberId);
        if (!member.getGym().getId().equals(gym.getId())) {
            throw new BusinessException("Member does not belong to your gym");
        }

        member.getUser().setName(request.getFullName());
        member.getUser().setPhone(request.getPhone());
        member.setMembershipPlan(request.getMembershipPlan());
        member.setStartDate(request.getStartDate());
        member.setEndDate(request.getEndDate());
        if (request.getStatus() != null) member.setStatus(request.getStatus());

        return toMemberResponse(memberRepository.save(member));
    }

    @Transactional
    public void deleteMember(Long ownerId, Long memberId) {
        Gym gym = getGymByOwner(ownerId);
        Member member = findMember(memberId);
        if (!member.getGym().getId().equals(gym.getId())) {
            throw new BusinessException("Member does not belong to your gym");
        }
        memberRepository.delete(member);
    }

    // ── Mappers ──────────────────────────────────────────────

    private MemberResponse toMemberResponse(Member m) {
        return MemberResponse.builder()
                .id(m.getId())
                .userId(m.getUser().getId())
                .fullName(m.getUser().getName())
                .email(m.getUser().getEmail())
                .phone(m.getUser().getPhone())
                .membershipPlan(m.getMembershipPlan())
                .startDate(m.getStartDate())
                .endDate(m.getEndDate())
                .status(m.getStatus())
                .active(m.getUser().isActive())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private Member findMember(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));
    }

    private String generateTempPassword() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }
}
