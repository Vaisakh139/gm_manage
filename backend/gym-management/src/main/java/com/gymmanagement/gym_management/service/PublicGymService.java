package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.PageResponse;
import com.gymmanagement.gym_management.dto.pub.GymPublicResponse;
import com.gymmanagement.gym_management.entity.Gym;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.mapper.GymMapper;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicGymService {

    private final GymRepository gymRepository;
    private final MemberRepository memberRepository;

    // ── Injected MapStruct mapper ─────────────────────────────
    private final GymMapper gymMapper;

    /** Search gyms by name or city — no authentication required */
    @Transactional(readOnly = true)
    public PageResponse<GymPublicResponse> search(String query, int page, int size) {
        var pageable = PageRequest.of(page, Math.min(size, 20));
        return PageResponse.from(
                gymRepository.searchByNameOrCity(query == null ? "" : query.trim(), pageable)
                             .map(this::toPublicResponse)
        );
    }

    /** Get a single gym's public details by id */
    @Transactional(readOnly = true)
    public GymPublicResponse getById(Long id) {
        Gym gym = gymRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found"));
        return toPublicResponse(gym);
    }

    // ── Helpers ───────────────────────────────────────────────

    /**
     * Uses {@link GymMapper#toGymPublicResponse(Gym)} for all static fields,
     * then injects the {@code totalMembers} count from the repository.
     * This pattern keeps the mapper pure while handling the derived field cleanly.
     */
    private GymPublicResponse toPublicResponse(Gym gym) {
        GymPublicResponse response = gymMapper.toGymPublicResponse(gym);
        response.setTotalMembers(memberRepository.countByGymId(gym.getId()));
        return response;
    }
}
