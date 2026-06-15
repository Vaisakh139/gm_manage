package com.gymmanagement.gym_management.repository;

import com.gymmanagement.gym_management.entity.Equipment;
import com.gymmanagement.gym_management.entity.EquipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByGymId(Long gymId);

    List<Equipment> findByGymIdOrderByCreatedAtDesc(Long gymId);

    Optional<Equipment> findByIdAndGymId(Long id, Long gymId);

    @Query("""
        SELECT e FROM Equipment e
        WHERE e.gym.id = :gymId
          AND (:search IS NULL OR :search = ''
               OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY e.createdAt DESC
        """)
    Page<Equipment> findByGymIdAndSearch(@Param("gymId") Long gymId,
                                          @Param("search") String search,
                                          Pageable pageable);

    // ── Count queries for dashboard ───────────────────────────

    long countByGymId(Long gymId);
    long countByGymIdAndStatus(Long gymId, EquipmentStatus status);

    /** Count across multiple gym IDs (for gym owner with many branches) */
    long countByGymIdIn(List<Long> gymIds);
    long countByGymIdInAndStatus(List<Long> gymIds, EquipmentStatus status);

    long countByStatus(EquipmentStatus status);
}
