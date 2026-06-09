package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.TrainerRequest;
import com.gymmanagement.gym_management.dto.TrainerResponse;
import com.gymmanagement.gym_management.model.*;
import com.gymmanagement.gym_management.repository.TrainerRepository;
import com.gymmanagement.gym_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<TrainerResponse> getAll() {
        return trainerRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TrainerResponse getById(Long id) {
        return toResponse(trainerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trainer not found")));
    }

    @Transactional(readOnly = true)
    public TrainerResponse getByUserId(Long userId) {
        return toResponse(trainerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Trainer not found")));
    }

    @Transactional
    public TrainerResponse create(TrainerRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        User user = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.TRAINER)
                .active(true)
                .build();

        Trainer trainer = Trainer.builder()
                .user(user)
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phone(req.getPhone())
                .specialization(req.getSpecialization())
                .bio(req.getBio())
                .active(true)
                .build();

        return toResponse(trainerRepository.save(trainer));
    }

    @Transactional
    public TrainerResponse update(Long id, TrainerRequest req) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        trainer.setFirstName(req.getFirstName());
        trainer.setLastName(req.getLastName());
        trainer.setPhone(req.getPhone());
        trainer.setSpecialization(req.getSpecialization());
        trainer.setBio(req.getBio());

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            trainer.getUser().setPassword(passwordEncoder.encode(req.getPassword()));
        }

        return toResponse(trainerRepository.save(trainer));
    }

    @Transactional
    public void delete(Long id) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        trainer.setActive(false);
        trainer.getUser().setActive(false);
        trainerRepository.save(trainer);
    }

    private TrainerResponse toResponse(Trainer t) {
        TrainerResponse r = new TrainerResponse();
        r.setId(t.getId());
        r.setEmail(t.getUser().getEmail());
        r.setFirstName(t.getFirstName());
        r.setLastName(t.getLastName());
        r.setPhone(t.getPhone());
        r.setSpecialization(t.getSpecialization());
        r.setBio(t.getBio());
        r.setActive(t.isActive());
        return r;
    }
}
