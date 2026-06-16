package com.gymmanagement.gym_management.repository;

import com.gymmanagement.gym_management.entity.Member;
import com.gymmanagement.gym_management.entity.MemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByUserId(Long userId);

    /** Search members in a gym by name, email, or phone */
    @Query("""
        SELECT m FROM Member m
        WHERE m.gym.id = :gymId
          AND (:search IS NULL OR :search = ''
               OR LOWER(m.user.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(m.user.email) LIKE LOWER(CONCAT('%', :search, '%'))
               OR m.user.phone LIKE CONCAT('%', :search, '%'))
        """)
    Page<Member> findByGymIdAndSearch(@Param("gymId") Long gymId,
                                       @Param("search") String search,
                                       Pageable pageable);

    /** Members assigned to a specific trainer */
    List<Member> findByAssignedTrainerId(Long trainerId);

    long countByGymId(Long gymId);
    long countByGymIdAndStatus(Long gymId, MemberStatus status);
    long countByStatus(MemberStatus status);
}
