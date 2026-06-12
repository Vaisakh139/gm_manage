package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.member.ProfileResponse;
import com.gymmanagement.gym_management.dto.member.UpdateProfileRequest;
import com.gymmanagement.gym_management.entity.Member;
import com.gymmanagement.gym_management.entity.User;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.mapper.MemberMapper;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberProfileService {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final MemberMapper memberMapper;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));

        log.debug("[MEMBER] Profile fetched | userId={} email={}", userId, member.getUser().getEmail());

        return memberMapper.toProfileResponse(member);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String oldName = user.getName();
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));

        log.info("[MEMBER] Profile updated | userId={} email={} oldName='{}' newName='{}'",
                userId, user.getEmail(), oldName, request.getName());

        return memberMapper.toProfileResponse(member);
    }
}
