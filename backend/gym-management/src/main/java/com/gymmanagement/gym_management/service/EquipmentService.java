package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.equipment.EquipmentRequest;
import com.gymmanagement.gym_management.dto.equipment.EquipmentResponse;
import com.gymmanagement.gym_management.entity.*;
import com.gymmanagement.gym_management.exception.BusinessException;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.mapper.EquipmentMapper;
import com.gymmanagement.gym_management.repository.EquipmentRepository;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final GymRepository gymRepository;
    private final MemberRepository memberRepository;
    private final EquipmentMapper equipmentMapper;

    // ── Admin ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EquipmentResponse> getAllEquipments() {
        return equipmentRepository.findAll()
                .stream()
                .map(equipmentMapper::toEquipmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EquipmentResponse getEquipmentById(Long equipmentId) {
        Equipment e = findEquipment(equipmentId);
        return equipmentMapper.toEquipmentResponse(e);
    }

    @Transactional
    public EquipmentResponse adminCreateEquipment(EquipmentRequest request) {
        if (request.getGymId() == null) {
            throw new BusinessException("gymId is required when admin creates equipment");
        }
        Gym gym = findGym(request.getGymId());

        Equipment equipment = equipmentMapper.toEquipment(request);
        equipment.setGym(gym);
        if (equipment.getStatus() == null) equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipment = equipmentRepository.save(equipment);

        log.info("[ADMIN] Equipment created | equipmentId={} gymId={} name='{}'",
                equipment.getId(), gym.getId(), equipment.getName());

        return equipmentMapper.toEquipmentResponse(equipment);
    }

    @Transactional
    public EquipmentResponse adminUpdateEquipment(Long equipmentId, EquipmentRequest request) {
        Equipment equipment = findEquipment(equipmentId);
        equipmentMapper.updateEquipmentFromRequest(request, equipment);
        equipment = equipmentRepository.save(equipment);

        log.info("[ADMIN] Equipment updated | equipmentId={}", equipmentId);

        return equipmentMapper.toEquipmentResponse(equipment);
    }

    @Transactional
    public void adminDeleteEquipment(Long equipmentId) {
        Equipment equipment = findEquipment(equipmentId);
        log.info("[ADMIN] Equipment deleted | equipmentId={} gymId={}",
                equipmentId, equipment.getGym().getId());
        equipmentRepository.delete(equipment);
    }

    // ── Gym Owner ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EquipmentResponse> getOwnerEquipments(Long gymId, Long ownerId) {
        validateGymOwnership(gymId, ownerId);
        return equipmentRepository.findByGymIdOrderByCreatedAtDesc(gymId)
                .stream()
                .map(equipmentMapper::toEquipmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EquipmentResponse getOwnerEquipmentById(Long equipmentId, Long ownerId) {
        Equipment equipment = findEquipment(equipmentId);
        validateGymOwnership(equipment.getGym().getId(), ownerId);
        return equipmentMapper.toEquipmentResponse(equipment);
    }

    @Transactional
    public EquipmentResponse ownerCreateEquipment(Long gymId, Long ownerId, EquipmentRequest request) {
        validateGymOwnership(gymId, ownerId);
        Gym gym = findGym(gymId);

        Equipment equipment = equipmentMapper.toEquipment(request);
        equipment.setGym(gym);
        if (equipment.getStatus() == null) equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipment = equipmentRepository.save(equipment);

        log.info("[GYM-OWNER] Equipment created | equipmentId={} gymId={} name='{}'",
                equipment.getId(), gymId, equipment.getName());

        return equipmentMapper.toEquipmentResponse(equipment);
    }

    @Transactional
    public EquipmentResponse ownerUpdateEquipment(Long equipmentId, Long ownerId, EquipmentRequest request) {
        Equipment equipment = findEquipment(equipmentId);
        validateGymOwnership(equipment.getGym().getId(), ownerId);

        equipmentMapper.updateEquipmentFromRequest(request, equipment);
        equipment = equipmentRepository.save(equipment);

        log.info("[GYM-OWNER] Equipment updated | equipmentId={}", equipmentId);

        return equipmentMapper.toEquipmentResponse(equipment);
    }

    @Transactional
    public void ownerDeleteEquipment(Long equipmentId, Long ownerId) {
        Equipment equipment = findEquipment(equipmentId);
        validateGymOwnership(equipment.getGym().getId(), ownerId);

        log.info("[GYM-OWNER] Equipment deleted | equipmentId={} gymId={}",
                equipmentId, equipment.getGym().getId());

        equipmentRepository.delete(equipment);
    }

    // ── Member ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EquipmentResponse> getMemberEquipments(Long userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        Long gymId = member.getGym().getId();

        return equipmentRepository.findByGymIdOrderByCreatedAtDesc(gymId)
                .stream()
                .map(equipmentMapper::toEquipmentResponse)
                .toList();
    }

    // ── Helpers ───────────────────────────────────────────────

    private Equipment findEquipment(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
    }

    private Gym findGym(Long gymId) {
        return gymRepository.findById(gymId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found with id: " + gymId));
    }

    /** Validates that the gym belongs to the given owner */
    private void validateGymOwnership(Long gymId, Long ownerId) {
        gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new BusinessException("Gym not found or does not belong to you"));
    }
}
