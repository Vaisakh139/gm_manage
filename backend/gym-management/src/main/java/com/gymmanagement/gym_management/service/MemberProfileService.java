package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.member.ProfileResponse;
import com.gymmanagement.gym_management.dto.member.UpdateProfileRequest;
import com.gymmanagement.gym_management.entity.Member;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberProfileService {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        return toProfileResponse(member);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        return toProfileResponse(member);
    }

    private ProfileResponse toProfileResponse(Member m) {
        return ProfileResponse.builder()
                .userId(m.getUser().getId())
                .name(m.getUser().getName())
                .email(m.getUser().getEmail())
                .phone(m.getUser().getPhone())
                .gymName(m.getGym().getGymName())
                .membershipPlan(m.getMembershipPlan())
                .startDate(m.getStartDate())
                .endDate(m.getEndDate())
                .memberStatus(m.getStatus())
                .build();
    }
}
