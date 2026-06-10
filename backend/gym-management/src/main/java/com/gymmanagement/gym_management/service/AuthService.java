package com.gymmanagement.gym_management.service;

import com.gymmanagement.gym_management.dto.auth.*;
import com.gymmanagement.gym_management.entity.*;
import com.gymmanagement.gym_management.exception.BusinessException;
import com.gymmanagement.gym_management.exception.ResourceNotFoundException;
import com.gymmanagement.gym_management.repository.GymRepository;
import com.gymmanagement.gym_management.repository.PasswordResetTokenRepository;
import com.gymmanagement.gym_management.repository.UserRepository;
import com.gymmanagement.gym_management.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final GymRepository gymRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ── Login ────────────────────────────────────────────────

    /** Authenticate and return a signed JWT with user details */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        var auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = (User) auth.getPrincipal();
        String token = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .passwordChanged(user.isPasswordChanged())
                .build();
    }

    // ── Self-Registration (Gym Owner) ────────────────────────

    /**
     * Public gym owner self-registration.
     * Creates a GYM_OWNER user + their Gym in one transaction,
     * then immediately returns a valid JWT so the user lands on their dashboard.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("An account with this email already exists");
        }

        // Create the owner's user account
        User owner = User.builder()
                .name(request.getOwnerName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.GYM_OWNER)
                .passwordChanged(true)   // they chose their own password
                .active(true)
                .build();
        userRepository.save(owner);

        // Create the gym linked to the owner
        Gym gym = Gym.builder()
                .gymName(request.getGymName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .owner(owner)
                .build();
        gymRepository.save(gym);

        // Issue a JWT so the frontend can immediately navigate to the dashboard
        String token = jwtUtil.generateToken(owner);
        return AuthResponse.builder()
                .token(token)
                .userId(owner.getId())
                .name(owner.getName())
                .email(owner.getEmail())
                .role(owner.getRole().name())
                .passwordChanged(true)
                .build();
    }

    // ── Change Password ──────────────────────────────────────

    /** Works for both first-login forced change and voluntary change */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUser(userId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChanged(true);
        userRepository.save(user);
    }

    // ── Forgot / Reset Password ──────────────────────────────

    /** Generate a time-limited reset token and email it to the user */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with that email"));

        tokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        tokenRepository.save(PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .build());

        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
    }

    /** Validate the reset token and apply the new password */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BusinessException("Invalid or expired reset token"));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new BusinessException("Reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChanged(true);
        userRepository.save(user);
        tokenRepository.delete(resetToken);
    }

    // ── Helpers ──────────────────────────────────────────────

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
