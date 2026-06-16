package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.gymowner.MemberResponse;
import com.gymmanagement.gym_management.dto.trainer.TrainerRequest;
import com.gymmanagement.gym_management.dto.trainer.TrainerResponse;
import com.gymmanagement.gym_management.entity.*;
import com.gymmanagement.gym_management.exception.BusinessException;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.mapper.MemberMapper;
import com.gymmanagement.gym_management.mapper.TrainerMapper;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.MemberRepository;
import com.gymmanagement.gym_management.repository.TrainerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final GymRepository gymRepository;
    private final MemberRepository memberRepository;
    private final TrainerMapper trainerMapper;
    private final MemberMapper memberMapper;

    // ── Gym Owner CRUD ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TrainerResponse> getTrainersForGym(Long gymId, Long ownerId) {
        validateOwnership(gymId, ownerId);
        return trainerRepository.findByGymIdOrderByNameAsc(gymId)
                .stream().map(t -> withMemberCount(t)).toList();
    }

    @Transactional(readOnly = true)
    public TrainerResponse getTrainerById(Long trainerId, Long ownerId) {
        Trainer t = findTrainerInOwnerGym(trainerId, ownerId);
        return withMemberCount(t);
    }

    @Transactional
    public TrainerResponse createTrainer(Long gymId, Long ownerId, TrainerRequest request) {
        Gym gym = findGymAndValidateOwnership(gymId, ownerId);

        Trainer trainer = trainerMapper.toEntity(request);
        trainer.setGym(gym);
        trainer.setActive(true);
        trainer = trainerRepository.save(trainer);

        log.info("[TRAINER] Created | trainerId={} name='{}' gymId={}", trainer.getId(), trainer.getName(), gymId);
        return withMemberCount(trainer);
    }

    @Transactional
    public TrainerResponse updateTrainer(Long trainerId, Long ownerId, TrainerRequest request) {
        Trainer trainer = findTrainerInOwnerGym(trainerId, ownerId);
        trainerMapper.update(request, trainer);
        trainer = trainerRepository.save(trainer);

        log.info("[TRAINER] Updated | trainerId={}", trainerId);
        return withMemberCount(trainer);
    }

    @Transactional
    public void deleteTrainer(Long trainerId, Long ownerId) {
        Trainer trainer = findTrainerInOwnerGym(trainerId, ownerId);

        // Unassign all members before deleting to avoid FK constraint violation
        List<Member> assigned = memberRepository.findByAssignedTrainerId(trainerId);
        assigned.forEach(m -> m.setAssignedTrainer(null));
        memberRepository.saveAll(assigned);

        log.info("[TRAINER] Deleted | trainerId={} name='{}'", trainerId, trainer.getName());
        trainerRepository.delete(trainer);
    }

    @Transactional
    public TrainerResponse toggleActive(Long trainerId, Long ownerId, boolean active) {
        Trainer trainer = findTrainerInOwnerGym(trainerId, ownerId);
        trainer.setActive(active);
        trainer = trainerRepository.save(trainer);
        log.info("[TRAINER] {} | trainerId={}", active ? "Activated" : "Deactivated", trainerId);
        return withMemberCount(trainer);
    }

    // ── Member assignment ─────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MemberResponse> getAssignedMembers(Long trainerId, Long ownerId) {
        findTrainerInOwnerGym(trainerId, ownerId);   // validates ownership
        return memberRepository.findByAssignedTrainerId(trainerId)
                .stream().map(memberMapper::toMemberResponse).toList();
    }

    @Transactional
    public MemberResponse assignMember(Long trainerId, Long memberId, Long ownerId) {
        Trainer trainer = findTrainerInOwnerGym(trainerId, ownerId);
        Member member   = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));

        // Validate same gym
        if (!member.getGym().getId().equals(trainer.getGym().getId())) {
            throw new BusinessException("Member and trainer must belong to the same gym");
        }

        member.setAssignedTrainer(trainer);
        member = memberRepository.save(member);

        log.info("[TRAINER] Member assigned | trainerId={} memberId={}", trainerId, memberId);
        return memberMapper.toMemberResponse(member);
    }

    @Transactional
    public MemberResponse unassignMember(Long trainerId, Long memberId, Long ownerId) {
        findTrainerInOwnerGym(trainerId, ownerId);
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));

        member.setAssignedTrainer(null);
        member = memberRepository.save(member);

        log.info("[TRAINER] Member unassigned | trainerId={} memberId={}", trainerId, memberId);
        return memberMapper.toMemberResponse(member);
    }

    // ── Member self-service ───────────────────────────────────

    @Transactional(readOnly = true)
    public TrainerResponse getMyTrainer(Long userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        if (member.getAssignedTrainer() == null) {
            return null;   // no trainer assigned — controller returns 200 with null data
        }
        return withMemberCount(member.getAssignedTrainer());
    }

    // ── Admin ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TrainerResponse> getAllTrainers() {
        return trainerRepository.findAll().stream().map(t -> withMemberCount(t)).toList();
    }

    // ── Helpers ───────────────────────────────────────────────

    private TrainerResponse withMemberCount(Trainer trainer) {
        TrainerResponse r = trainerMapper.toResponse(trainer);
        r.setAssignedMembersCount(memberRepository.findByAssignedTrainerId(trainer.getId()).size());
        return r;
    }

    private Gym findGymAndValidateOwnership(Long gymId, Long ownerId) {
        return gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new BusinessException("Gym not found or does not belong to you"));
    }

    private void validateOwnership(Long gymId, Long ownerId) {
        findGymAndValidateOwnership(gymId, ownerId);
    }

    private Trainer findTrainerInOwnerGym(Long trainerId, Long ownerId) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found: " + trainerId));
        gymRepository.findByIdAndOwnerId(trainer.getGym().getId(), ownerId)
                .orElseThrow(() -> new BusinessException("Trainer does not belong to one of your gyms"));
        return trainer;
    }
}
