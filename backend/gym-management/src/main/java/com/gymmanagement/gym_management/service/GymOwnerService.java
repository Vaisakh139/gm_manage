package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.PageResponse;
import com.gymmanagement.gym_management.dto.admin.GymResponse;
import com.gymmanagement.gym_management.dto.gymowner.*;
import com.gymmanagement.gym_management.entity.*;
import com.gymmanagement.gym_management.exception.BusinessException;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.mapper.GymMapper;
import com.gymmanagement.gym_management.mapper.MemberMapper;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GymOwnerService {

    private final GymRepository gymRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final MemberMapper memberMapper;
    private final GymMapper gymMapper;

    // ── Gym management ────────────────────────────────────────

    /** All gyms owned by this user, mapped to DTOs within the transaction */
    @Transactional(readOnly = true)
    public List<GymResponse> getMyGyms(Long ownerId) {
        return gymRepository.findByOwnerIdOrderByCreatedAtAsc(ownerId)
                .stream()
                .map(gymMapper::toGymResponse)   // owner accessed here — session still open
                .toList();
    }

    /** Get a single gym DTO, validating that it belongs to the current owner */
    @Transactional(readOnly = true)
    public GymResponse getGymById(Long gymId, Long ownerId) {
        return gymMapper.toGymResponse(findGymByIdAndOwner(gymId, ownerId));
    }

    /**
     * A gym owner creates a new branch under their account.
     * No admin involvement needed — the current user becomes the owner.
     */
    @Transactional
    public GymResponse createGym(Long ownerId, GymOwnerGymRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner user not found"));

        Gym gym = Gym.builder()
                .gymName(request.getGymName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .owner(owner)
                .build();
        gym = gymRepository.save(gym);

        log.info("[GYM-OWNER] New gym created | gymId={} gymName='{}' ownerId={}",
                gym.getId(), gym.getGymName(), ownerId);

        return gymMapper.toGymResponse(gym);
    }

    /** Update a specific gym — validates that it belongs to the current owner */
    @Transactional
    public GymResponse updateGym(Long gymId, Long ownerId, GymOwnerGymRequest request) {
        Gym gym = findGymByIdAndOwner(gymId, ownerId);
        String oldName = gym.getGymName();

        gym.setGymName(request.getGymName());
        gym.setAddress(request.getAddress());
        gym.setPhone(request.getPhone());

        GymResponse response = gymMapper.toGymResponse(gymRepository.save(gym));

        log.info("[GYM-OWNER] Gym updated | gymId={} oldName='{}' newName='{}' ownerId={}",
                gymId, oldName, request.getGymName(), ownerId);

        return response;
    }

    // ── Dashboard ─────────────────────────────────────────────

    /**
     * Aggregated stats across ALL gyms owned by this user,
     * plus a per-gym breakdown list.
     */
    @Transactional(readOnly = true)
    public GymOwnerDashboardResponse getDashboard(Long ownerId) {
        List<Gym> gyms = gymRepository.findByOwnerIdOrderByCreatedAtAsc(ownerId);

        long totalMembers = 0, active = 0, inactive = 0, expired = 0;
        List<GymOwnerDashboardResponse.GymStat> gymStats = new ArrayList<>();

        for (Gym gym : gyms) {
            long total    = memberRepository.countByGymId(gym.getId());
            long act      = memberRepository.countByGymIdAndStatus(gym.getId(), MemberStatus.ACTIVE);
            long inact    = memberRepository.countByGymIdAndStatus(gym.getId(), MemberStatus.INACTIVE);
            long exp      = memberRepository.countByGymIdAndStatus(gym.getId(), MemberStatus.EXPIRED);

            totalMembers += total;
            active       += act;
            inactive     += inact;
            expired      += exp;

            gymStats.add(GymOwnerDashboardResponse.GymStat.builder()
                    .gymId(gym.getId())
                    .gymName(gym.getGymName())
                    .address(gym.getAddress())
                    .totalMembers(total)
                    .activeMembers(act)
                    .build());
        }

        GymOwnerDashboardResponse dashboard = GymOwnerDashboardResponse.builder()
                .totalGyms(gyms.size())
                .totalMembers(totalMembers)
                .activeMembers(active)
                .inactiveMembers(inactive)
                .expiredMembers(expired)
                .gymStats(gymStats)
                .build();

        log.debug("[GYM-OWNER] Dashboard | ownerId={} gyms={} totalMembers={}",
                ownerId, gyms.size(), totalMembers);

        return dashboard;
    }

    // ── Members ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<MemberResponse> getMembers(Long gymId, Long ownerId,
                                                    String search, int page, int size) {
        Gym gym = findGymByIdAndOwner(gymId, ownerId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<MemberResponse> result = PageResponse.from(
                memberRepository.findByGymIdAndSearch(gym.getId(), search, pageable)
                                .map(memberMapper::toMemberResponse)
        );

        log.debug("[GYM-OWNER] Members listed | gym='{}' search='{}' page={} total={}",
                gym.getGymName(), search, page, result.getTotalElements());

        return result;
    }

    @Transactional(readOnly = true)
    public MemberResponse getMember(Long memberId, Long ownerId) {
        Member member = findMemberAndValidateOwner(memberId, ownerId);
        return memberMapper.toMemberResponse(member);
    }

    @Transactional
    public MemberResponse addMember(Long gymId, Long ownerId, MemberRequest request) {
        Gym gym = findGymByIdAndOwner(gymId, ownerId);

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("[GYM-OWNER] Add member failed — email in use: {} | gym='{}'",
                    request.getEmail(), gym.getGymName());
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

        log.info("[GYM-OWNER] Member added | gym='{}' memberEmail={} plan='{}' memberId={}",
                gym.getGymName(), user.getEmail(), request.getMembershipPlan(), member.getId());

        return memberMapper.toMemberResponse(member);
    }

    @Transactional
    public MemberResponse updateMember(Long memberId, Long ownerId, MemberRequest request) {
        Member member = findMemberAndValidateOwner(memberId, ownerId);

        member.getUser().setName(request.getFullName());
        member.getUser().setPhone(request.getPhone());
        member.setMembershipPlan(request.getMembershipPlan());
        member.setStartDate(request.getStartDate());
        member.setEndDate(request.getEndDate());
        if (request.getStatus() != null) member.setStatus(request.getStatus());

        MemberResponse response = memberMapper.toMemberResponse(memberRepository.save(member));

        log.info("[GYM-OWNER] Member updated | memberId={} email={} plan='{}' status={}",
                memberId, member.getUser().getEmail(), request.getMembershipPlan(), member.getStatus());

        return response;
    }

    @Transactional
    public void deleteMember(Long memberId, Long ownerId) {
        Member member = findMemberAndValidateOwner(memberId, ownerId);

        log.info("[GYM-OWNER] Member deleted | memberId={} email={} gym='{}'",
                memberId, member.getUser().getEmail(), member.getGym().getGymName());

        memberRepository.delete(member);
    }

    // ── Helpers ───────────────────────────────────────────────

    /**
     * Load a Gym by id and verify it belongs to the given owner.
     * Mapping to a DTO MUST happen while calling code is still inside a
     * @Transactional method — otherwise gym.owner (LAZY) causes
     * LazyInitializationException during Jackson serialisation.
     */
    private Gym findGymByIdAndOwner(Long gymId, Long ownerId) {
        return gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Gym not found or does not belong to you (gymId=" + gymId + ")"));
    }

    /**
     * Load a Member by id and verify the member's gym belongs to the current owner.
     */
    private Member findMemberAndValidateOwner(Long memberId, Long ownerId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + memberId));
        if (!member.getGym().getOwner().getId().equals(ownerId)) {
            throw new BusinessException("This member does not belong to one of your gyms");
        }
        return member;
    }

    private String generateTempPassword() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }
}
