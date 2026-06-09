# Conventions

## General

- All code is written in English — variable names, comments, commit messages, and documentation.
- No commented-out code is committed. Use version control history instead.
- Every file must have a single clear responsibility.

---

## Backend (Java / Spring Boot)

### Naming

| Construct         | Convention          | Example                         |
|-------------------|---------------------|---------------------------------|
| Classes           | PascalCase          | `MemberService`, `PaymentController` |
| Methods           | camelCase           | `findMemberById`, `recordPayment` |
| Variables         | camelCase           | `memberList`, `planId`          |
| Constants         | UPPER_SNAKE_CASE    | `MAX_TOKEN_EXPIRY`              |
| Packages          | lowercase           | `com.gym.management.member`     |
| Database entities | PascalCase          | `Member`, `WorkoutPlan`         |
| REST endpoints    | kebab-case (plural) | `/api/v1/membership-plans`      |

### Package Structure

```
com.gym.management
├── auth/           # JWT filters, security config, auth controller
├── member/         # Member entity, repo, service, controller, DTOs
├── trainer/        # Trainer entity, repo, service, controller, DTOs
├── plan/           # MembershipPlan entity, repo, service, controller, DTOs
├── payment/        # Payment entity, repo, service, controller, DTOs
├── workout/        # WorkoutPlan entity, repo, service, controller, DTOs
├── dashboard/      # Dashboard service and controller
├── common/         # Shared DTOs, exceptions, response wrappers, utils
└── config/         # App config, CORS, security filter chain
```

### DTOs and Entities

- Entities are only used inside the service and repository layers — never returned from controllers.
- Use separate `Request` and `Response` DTOs per endpoint type.
- Example: `CreateMemberRequest`, `MemberResponse`, `UpdateMemberRequest`.
- Use `record` types for simple read-only DTOs where appropriate.

### Exception Handling

- Define custom exceptions in `common/exception/` (e.g., `ResourceNotFoundException`, `DuplicateEmailException`).
- Use a single `@RestControllerAdvice` class to handle all exceptions globally.
- Never catch and swallow exceptions silently.

### Validation

- Use Bean Validation (`@NotNull`, `@Email`, `@Size`, etc.) on all request DTOs.
- Annotate controller method parameters with `@Valid` to trigger validation.

### Transactions

- `@Transactional` belongs on service methods, not repository methods.
- Keep transactions short — do not include external calls inside a transaction boundary.

---

## Frontend (React / TypeScript)

### Naming

| Construct         | Convention    | Example                          |
|-------------------|---------------|----------------------------------|
| Components        | PascalCase    | `MemberCard`, `PaymentTable`     |
| Hooks             | camelCase, `use` prefix | `useMemberList`, `useAuth` |
| Files (components)| PascalCase    | `MemberCard.tsx`                 |
| Files (utils/hooks)| camelCase   | `formatDate.ts`, `useAuth.ts`    |
| Types/Interfaces  | PascalCase    | `Member`, `MembershipPlan`       |
| CSS classes       | kebab-case (Tailwind utilities only) | N/A  |
| Redux slices      | camelCase     | `memberSlice`, `authSlice`       |
| API functions     | camelCase, verb-first | `fetchMembers`, `createPayment` |

### Component Rules

- Prefer functional components with hooks — no class components.
- Each component lives in its own file.
- Props interfaces are defined in the same file as the component, named `{ComponentName}Props`.
- Do not put business logic inside components — extract to custom hooks.

### State Management

- Global auth state: Redux Toolkit slice.
- Server state (lists, details): React Query (`useQuery`, `useMutation`).
- Local UI state (modals, form inputs): `useState`.

### API Layer

- All API calls go through centralized functions in `src/api/`.
- Axios instance in `src/api/axiosInstance.ts` handles base URL and JWT injection.
- No `fetch` calls directly in components or hooks.

### TypeScript

- `strict` mode enabled — no `any` types without explicit justification.
- All API response shapes are typed in `src/types/`.
- Avoid non-null assertions (`!`) — use optional chaining and guards instead.

---

## Database

- Table names: plural, snake_case (`membership_plans`, `workout_plans`).
- Column names: snake_case (`user_id`, `created_at`).
- Foreign key column name: `{referenced_table_singular}_id` (e.g., `member_id`).
- Timestamps: always `TIMESTAMPTZ` (timezone-aware), named `created_at` and `updated_at`.
- Soft deletes preferred over hard deletes — use `is_active` flag.
- All schema changes through Flyway migrations only.

---

## Git

### Branch Naming

```
feature/<short-description>
bugfix/<short-description>
hotfix/<short-description>
chore/<short-description>
```

### Commit Messages

Follow the Conventional Commits specification:

```
<type>(<scope>): <short description>

feat(member): add member deactivation endpoint
fix(auth): correct token expiry calculation
chore(deps): upgrade Spring Boot to 3.3.0
docs(api): add payment endpoint examples
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`.

### Pull Requests

- Every PR targets `main` and requires at least one review before merge.
- PR title follows the same Conventional Commits format.
- Link the relevant issue in the PR description.
- PRs should be small and focused on a single concern.
