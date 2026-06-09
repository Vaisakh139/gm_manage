package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.MemberRequest;
import com.gymmanagement.gym_management.dto.MemberResponse;
import com.gymmanagement.gym_management.model.*;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.MembershipPlanRepository;
import com.gymmanagement.gym_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final MembershipPlanRepository planRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<MemberResponse> getAll() {
        return memberRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MemberResponse getById(Long id) {
        return toResponse(memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found")));
    }

    @Transactional(readOnly = true)
    public MemberResponse getByUserId(Long userId) {
        return toResponse(memberRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Member not found")));
    }

    @Transactional
    public MemberResponse create(MemberRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        User user = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.MEMBER)
                .active(true)
                .build();

        MembershipPlan plan = req.getMembershipPlanId() != null
                ? planRepository.findById(req.getMembershipPlanId()).orElse(null)
                : null;

        Member member = Member.builder()
                .user(user)
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phone(req.getPhone())
                .address(req.getAddress())
                .membershipPlan(plan)
                .joinDate(req.getJoinDate())
                .membershipExpiry(req.getMembershipExpiry())
                .active(true)
                .build();

        return toResponse(memberRepository.save(member));
    }

    @Transactional
    public MemberResponse update(Long id, MemberRequest req) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        member.setFirstName(req.getFirstName());
        member.setLastName(req.getLastName());
        member.setPhone(req.getPhone());
        member.setAddress(req.getAddress());
        member.setJoinDate(req.getJoinDate());
        member.setMembershipExpiry(req.getMembershipExpiry());

        if (req.getMembershipPlanId() != null) {
            planRepository.findById(req.getMembershipPlanId()).ifPresent(member::setMembershipPlan);
        }

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            member.getUser().setPassword(passwordEncoder.encode(req.getPassword()));
        }

        return toResponse(memberRepository.save(member));
    }

    @Transactional
    public void delete(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setActive(false);
        member.getUser().setActive(false);
        memberRepository.save(member);
    }

    private MemberResponse toResponse(Member m) {
        MemberResponse r = new MemberResponse();
        r.setId(m.getId());
        r.setEmail(m.getUser().getEmail());
        r.setFirstName(m.getFirstName());
        r.setLastName(m.getLastName());
        r.setPhone(m.getPhone());
        r.setAddress(m.getAddress());
        r.setJoinDate(m.getJoinDate());
        r.setMembershipExpiry(m.getMembershipExpiry());
        r.setActive(m.isActive());
        if (m.getMembershipPlan() != null) {
            r.setMembershipPlanId(m.getMembershipPlan().getId());
            r.setMembershipPlanName(m.getMembershipPlan().getName());
        }
        return r;
    }
}
