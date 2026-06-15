# Testing Guide

## Current Status

The project currently has no automated tests. This document describes the recommended test strategy for each layer.

---

## Manual API Testing

Use any HTTP client (curl, Postman, Bruno, Insomnia) against `http://localhost:8080`.

### Auth Flow

```bash
# 1. Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gym.com","password":"admin123"}'

# Save the token from the response
TOKEN="eyJhbGci..."

# 2. Get dashboard stats
curl http://localhost:8080/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"

# 3. Create a gym (also creates gym owner, sends email)
curl -X POST http://localhost:8080/api/admin/gyms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gymName": "Test Gym",
    "address": "123 Test St",
    "phone": "+1234567890",
    "ownerName": "Test Owner",
    "ownerEmail": "owner@test.com",
    "ownerPhone": "+0987654321"
  }'
```

### Gym Owner Flow

```bash
# Login as gym owner (use email from gym creation)
curl -X POST http://localhost:8080/api/auth/login \
  -d '{"email":"owner@test.com","password":"<temp-password-from-email>"}'

OWNER_TOKEN="eyJhbGci..."

# Change password (required on first login)
curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"currentPassword":"<temp>","newPassword":"newpass123"}'

# Create another gym branch
curl -X POST http://localhost:8080/api/gym-owner/gyms \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"gymName":"Second Branch","address":"456 Other St"}'

# Get dashboard (shows all branches)
curl http://localhost:8080/api/gym-owner/dashboard \
  -H "Authorization: Bearer $OWNER_TOKEN"

# Add a member to branch (gymId from dashboard response)
curl -X POST http://localhost:8080/api/members \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "gymId": 1,
    "fullName": "Test Member",
    "email": "member@test.com",
    "membershipPlan": "Premium",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31"
  }'

# List members of a branch
curl "http://localhost:8080/api/members?gymId=1&search=Test" \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

### Public Endpoints (no auth)

```bash
# Search gyms by name or city
curl "http://localhost:8080/api/public/gyms?query=Test"

# Self-register as gym owner
curl -X POST http://localhost:8080/api/auth/register \
  -d '{
    "gymName":"My Gym",
    "ownerName":"New Owner",
    "email":"newowner@test.com",
    "phone":"+1112223333",
    "address":"789 New St",
    "password":"mypass123"
  }'
```

---

## Recommended Test Strategy

### Backend Unit Tests

Priority: **Service layer** — business logic is here.

**Tools:** JUnit 5 (included via `spring-boot-starter-data-jpa-test`), Mockito

```java
@ExtendWith(MockitoExtension.class)
class GymOwnerServiceTest {

    @Mock GymRepository gymRepository;
    @Mock MemberRepository memberRepository;
    @Mock UserRepository userRepository;
    @Mock EmailService emailService;
    @Mock MemberMapper memberMapper;
    @Mock GymMapper gymMapper;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks GymOwnerService gymOwnerService;

    @Test
    void addMember_emailAlreadyInUse_throwsBusinessException() {
        when(gymRepository.findByIdAndOwnerId(1L, 1L)).thenReturn(Optional.of(mockGym()));
        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        MemberRequest request = new MemberRequest();
        request.setEmail("existing@test.com");
        request.setGymId(1L);

        assertThrows(BusinessException.class,
            () -> gymOwnerService.addMember(1L, 1L, request));
    }

    @Test
    void getDashboard_aggregatesAcrossAllBranches() {
        List<Gym> gyms = List.of(mockGym(1L, "Branch A"), mockGym(2L, "Branch B"));
        when(gymRepository.findByOwnerIdOrderByCreatedAtAsc(1L)).thenReturn(gyms);
        when(memberRepository.countByGymId(1L)).thenReturn(10L);
        when(memberRepository.countByGymId(2L)).thenReturn(20L);
        // ...

        GymOwnerDashboardResponse result = gymOwnerService.getDashboard(1L);

        assertThat(result.getTotalMembers()).isEqualTo(30);
        assertThat(result.getTotalGyms()).isEqualTo(2);
        assertThat(result.getGymStats()).hasSize(2);
    }
}
```

### Backend Integration Tests

Test the full stack with a real (test) database.

**Tools:** `@SpringBootTest`, Testcontainers (PostgreSQL), `@Transactional` for rollback

```java
@SpringBootTest
@Transactional
class GymOwnerControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired GymRepository gymRepository;

    @Test
    void createGymBranch_returnsGymResponse() throws Exception {
        String token = loginAsGymOwner();

        mockMvc.perform(post("/api/gym-owner/gyms")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"gymName":"New Branch","address":"456 St","phone":"+1234"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.gymName").value("New Branch"));
    }
}
```

### Backend Test Coverage Targets

| Layer | Target Coverage |
|---|---|
| Services (business logic) | 80% |
| Controllers (happy path + error paths) | 70% |
| Repositories (custom queries) | 60% |
| Security (JWT validation) | 80% |

### Frontend Component Tests

**Tools:** Vitest + React Testing Library

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import * as api from '../../api/axios';
import Dashboard from './Dashboard';

vi.mock('../../api/axios');

test('shows gym stats on load', async () => {
    vi.mocked(api.gymOwnerApi.getDashboard).mockResolvedValue({
        data: {
            data: {
                totalGyms: 2,
                totalMembers: 50,
                activeMembers: 45,
                inactiveMembers: 3,
                expiredMembers: 2,
                gymStats: []
            }
        }
    } as never);

    render(<Dashboard />);

    await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument();
    });
});
```

### Frontend E2E Tests

**Tools:** Playwright

```typescript
import { test, expect } from '@playwright/test';

test('gym owner can add a member', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[type=email]', 'owner@test.com');
    await page.fill('[type=password]', 'password123');
    await page.click('[type=submit]');

    // Navigate to members
    await page.click('text=Members');
    await page.click('text=+ Add Member');

    // Fill form
    await page.selectOption('select[name=gymId]', '1');
    await page.fill('[placeholder="Full Name"]', 'New Member');
    await page.fill('[type=email]', 'newmember@test.com');
    await page.click('text=Add Member');

    // Verify success toast
    await expect(page.locator('text=Member added')).toBeVisible();
});
```

---

## Test Data Setup

Use `DataInitializer` as a reference for seeding test data. For integration tests, create a separate `TestDataInitializer` that runs before each test class:

```java
@Component
@Profile("test")
public class TestDataInitializer implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // Create test admin, gym owner, member, gyms
    }
}
```

---

## Running Tests

```bash
# Backend
./mvnw test                    # Run all tests
./mvnw test -pl backend        # Run backend tests only
./mvnw test -Dtest=GymOwnerServiceTest  # Run specific test class

# Frontend
npm test                       # Run all component tests (after installing vitest)
npx playwright test            # Run E2E tests (after installing playwright)
```
