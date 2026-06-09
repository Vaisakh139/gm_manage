# Testing Guide

## Philosophy

- Tests verify behavior, not implementation details.
- Each test should be independent and repeatable.
- Tests are written alongside the feature, not after.
- A failing test must be fixed before the code is merged — never skipped without a documented reason.

---

## Backend Testing (Java / Spring Boot)

### Test Types

| Type              | Tool                          | Location                          |
|-------------------|-------------------------------|-----------------------------------|
| Unit Tests        | JUnit 5 + Mockito             | `src/test/java/.../unit/`         |
| Integration Tests | Spring Boot Test + Testcontainers | `src/test/java/.../integration/` |
| Repository Tests  | `@DataJpaTest` + H2 or Testcontainers | `src/test/java/.../repository/` |

### Dependencies

- `spring-boot-starter-test` (includes JUnit 5, Mockito, AssertJ)
- `testcontainers` with `postgresql` module
- `spring-security-test` for security context in tests

---

### Unit Tests

Unit tests target the **service layer** in isolation. All external dependencies (repositories, other services) are mocked.

```java
@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private MemberService memberService;

    @Test
    void findMemberById_shouldReturnMember_whenExists() {
        // Arrange
        Member member = new Member();
        member.setId(1L);
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // Act
        MemberResponse result = memberService.findById(1L);

        // Assert
        assertThat(result.getId()).isEqualTo(1L);
    }
}
```

**Rules:**
- Name tests: `methodName_shouldExpectedBehavior_whenCondition`.
- Use `assertThat` from AssertJ — not `assertEquals`.
- Test both the happy path and error/edge cases (e.g., `ResourceNotFoundException` when not found).

---

### Integration Tests

Integration tests target the **controller layer** and use a real database via Testcontainers. They test the full request-to-response cycle.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class MemberControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getMembers_shouldReturn403_whenUnauthenticated() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/v1/members", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
```

**Rules:**
- Every integration test that modifies data must clean up after itself (use `@Transactional` or `@Sql` reset scripts).
- Do not mock the database in integration tests.
- Each controller must have at least one integration test per endpoint covering auth and business rules.

---

### Running Backend Tests

```bash
cd backend

# All tests
./mvnw test

# Specific test class
./mvnw test -Dtest=MemberServiceTest

# Skip tests (build only)
./mvnw package -DskipTests
```

---

## Frontend Testing (React / TypeScript)

### Test Types

| Type              | Tool                   | Location              |
|-------------------|------------------------|-----------------------|
| Unit Tests        | Vitest + React Testing Library | `src/**/__tests__/` |
| Component Tests   | Vitest + React Testing Library | `src/**/__tests__/` |
| E2E Tests         | Playwright             | `e2e/`                |

### Dependencies

- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `msw` (Mock Service Worker) for API mocking
- `@playwright/test` for E2E

---

### Unit / Component Tests

Test components through user interactions, not internal state.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemberCard from '../MemberCard';

test('displays member name', () => {
  render(<MemberCard name="John Doe" plan="Gold" />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

test('calls onEdit when edit button is clicked', async () => {
  const onEdit = vi.fn();
  render(<MemberCard name="John Doe" plan="Gold" onEdit={onEdit} />);
  await userEvent.click(screen.getByRole('button', { name: /edit/i }));
  expect(onEdit).toHaveBeenCalledOnce();
});
```

**Rules:**
- Query elements by role or accessible name — never by test ID unless unavoidable.
- Mock API calls with MSW handlers, not by mocking Axios directly.
- Do not test implementation details (internal state, private methods).

---

### E2E Tests (Playwright)

E2E tests cover critical user flows end to end against a running local environment.

**Flows to cover:**
- Admin can log in, create a member, and view them in the list.
- Trainer can log in, create a workout plan, and assign it to a member.
- Member can log in and view their profile, active plan, and payment history.

```bash
cd frontend

# Run all E2E tests
npx playwright test

# Run in headed mode (with browser UI)
npx playwright test --headed

# Run a specific test file
npx playwright test e2e/auth.spec.ts
```

---

### Running Frontend Tests

```bash
cd frontend

# Unit and component tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Coverage Targets

| Area              | Target     |
|-------------------|------------|
| Backend services  | ≥ 80%      |
| Backend controllers | ≥ 70%    |
| Frontend components | ≥ 70%    |
| Critical flows (E2E) | 100% of defined flows |

Coverage is measured but not gated on every commit. Coverage drops on core modules (service, controller) must be reviewed in PR.
