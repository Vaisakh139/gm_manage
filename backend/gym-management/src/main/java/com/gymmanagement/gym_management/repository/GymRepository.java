package com.gymmanagement.gym_management.repository;

import com.gymmanagement.gym_management.entity.Gym;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GymRepository extends JpaRepository<Gym, Long> {

    /** All gyms owned by a given user (multiple branches allowed) */
    List<Gym> findByOwnerIdOrderByCreatedAtAsc(Long ownerId);

    /** Quick existence check — used before creating a new owner user */
    boolean existsByOwnerId(Long ownerId);

    /** Count gyms owned by a user */
    long countByOwnerId(Long ownerId);

    /** Resolve a gym by id and verify ownership in one query */
    Optional<Gym> findByIdAndOwnerId(Long id, Long ownerId);

    /**
     * Public full-text search across gym name and address/city.
     * Used by the unauthenticated landing-page gym finder.
     */
    @Query("""
        SELECT g FROM Gym g
        WHERE :query IS NULL OR :query = ''
           OR LOWER(g.gymName) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(g.address) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY g.gymName ASC
        """)
    Page<Gym> searchByNameOrCity(@Param("query") String query, Pageable pageable);
}
