# Conventions

## Backend (Java / Spring Boot)

### Imports
- Always use `jakarta.*` — **never** `javax.*` (Spring Boot 4 uses Jakarta EE 11)
- Group imports: Java stdlib, then Spring, then third-party, then project classes

### Lombok
Use these annotations consistently:

| Annotation | Where |
|---|---|
| `@Data` | DTOs and entities (generates getters, setters, equals, hashCode, toString) |
| `@Builder` | DTOs and entities (fluent construction) |
| `@Builder.Default` | Fields with non-zero/non-null defaults in `@Builder` classes |
| `@NoArgsConstructor` + `@AllArgsConstructor` | Entities (required by JPA + MapStruct) |
| `@RequiredArgsConstructor` | Services, controllers (constructor injection) |
| `@Slf4j` | Services, filters (provides `log` field) |

```java
// Entity — correct defaults
@Builder.Default
@Column(nullable = false)
private boolean active = true;   // without @Builder.Default, builder sets to false

// Entity — wrong (will warn and use Java default in builder)
private boolean active = true;   // @Builder ignores initializer
```

### Package Structure

Active packages (do not add new code to any other package):

```
entity/         JPA entities only
repository/     Spring Data JPA interfaces only
service/        Business logic, @Transactional
controller/     REST controllers, @PreAuthorize
dto/            Request and Response classes, nested by domain
  auth/
  admin/
  gymowner/
  member/
  pub/
mapper/         MapStruct interfaces
security/       JWT, filter, UserDetailsService
config/         Spring configuration classes
filter/         Servlet filters
exception/      Exception classes and GlobalExceptionHandler
```

The `model/` package contains **empty legacy stubs** — never add code there.

### DTOs

- Separate `XxxRequest` and `XxxResponse` for every endpoint
- Never return a JPA entity from a controller — always map to a DTO
- Mapping **must** happen inside a `@Transactional` service method (lazy relations)

### Services

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class GymOwnerService {
    // Constructor injection via @RequiredArgsConstructor
    private final GymRepository gymRepository;

    // Read operations
    @Transactional(readOnly = true)
    public GymResponse getGymById(Long gymId, Long ownerId) { ... }

    // Write operations
    @Transactional
    public GymResponse createGym(Long ownerId, GymOwnerGymRequest request) {
        // ... business logic ...
        log.info("[GYM-OWNER] New gym created | gymId={} gymName='{}' ownerId={}",
                gym.getId(), gym.getGymName(), ownerId);
        return gymMapper.toGymResponse(gym);  // map inside @Transactional
    }
}
```

### Logging Format

```java
// Prefix: [CONTEXT] where context is AUTH, ADMIN, GYM-OWNER, MEMBER
// Format: key=value pairs for structured log parsing
log.info("[AUTH] Login successful | email={} role={}", email, role);
log.warn("[AUTH] Registration failed — email in use: {}", email);
log.info("[GYM-OWNER] Member added | gym='{}' memberEmail={} memberId={}", gymName, email, id);
log.debug("[GYM-OWNER] Members listed | gym='{}' search='{}' page={} total={}", ...);
```

Levels: `ERROR` (system failures), `WARN` (business rule violations), `INFO` (write operations), `DEBUG` (read operations)

### Controllers

```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")  // class level — applies to all methods
@RequiredArgsConstructor
public class AdminController {

    @GetMapping("/gyms")
    public ResponseEntity<ApiResponse<List<GymResponse>>> getAllGyms() {
        return ResponseEntity.ok(ApiResponse.ok("Gyms fetched", adminService.getAllGyms()));
    }
}
```

- Always use `hasAuthority('ROLE_X')` not `hasRole('X')` — avoids Spring Security 7 prefix issues
- Wrap all responses in `ApiResponse.ok(message, data)`
- Use `@Valid` on request body parameters

### MapStruct Mappers

```java
@Mapper(componentModel = "spring")
public interface GymMapper {
    @Mapping(source = "owner.id",    target = "ownerId")
    @Mapping(source = "owner.name",  target = "ownerName")
    @Mapping(source = "owner.email", target = "ownerEmail")
    GymResponse toGymResponse(Gym gym);    // owner.* accessed here — must be within @Transactional
}
```

- `componentModel = "spring"` → generates `@Component`, injectable via `@RequiredArgsConstructor`
- Annotation processor order in pom.xml: **Lombok → lombok-mapstruct-binding → MapStruct**

### Exceptions

```java
// Resource not found → 404
throw new ResourceNotFoundException("Gym not found with id: " + id);

// Business rule violation → 400
throw new BusinessException("Email already in use: " + email);

// Do NOT throw RuntimeException directly — always use typed exceptions
```

---

## Frontend (TypeScript / React)

### Imports

```typescript
// Type-only imports REQUIRED (verbatimModuleSyntax is enabled)
import type { Gym, Member } from '../../types';

// Value imports
import { gymOwnerApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
```

Never use `import { SomeType }` for types — always `import type { SomeType }`.

### TypeScript

- No `any` types — use `unknown` with type guards if needed
- All API response types defined in `types/index.ts`
- All API call functions typed with proper generics in `api/axios.ts`

### API Calls

All calls go through the single Axios instance in `api/axios.ts`:

```typescript
// DO NOT create new axios instances
// DO NOT call fetch() directly
// Always use the exported API objects:
import { adminApi, gymOwnerApi, memberApi, authApi, publicApi } from '../../api';
```

### Error Handling

Every API call **must** have a `.catch()` and an error state:

```typescript
const [error, setError] = useState('');
const [loading, setLoading] = useState(true);

useEffect(() => {
    adminApi.getGyms()
        .then((r) => setGyms(r.data.data))
        .catch(() => setError('Failed to load gyms'))
        .finally(() => setLoading(false));
}, []);

if (loading) return <SkeletonLoader />;
if (error)   return <ErrorMessage message={error} />;
```

### Loading States

Every data-fetching component must show a skeleton/placeholder while loading:

```typescript
if (loading) return (
    <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
        ))}
    </div>
);
```

### Component Structure

```
pages/<role>/<PageName>.tsx
    useState for data, loading, error
    useEffect to fetch data
    Early returns for loading/error
    Render JSX
    Handlers (save, delete, etc.)
```

### Tailwind CSS

Using Tailwind CSS v4 (`@import "tailwindcss"` in `index.css`).

Common utility patterns:
```
bg-gray-900          dark backgrounds (sidebar, hero)
bg-white             cards, modals, forms
text-gray-900        primary text
text-gray-500        secondary / muted text
border-gray-200      card borders
rounded-xl           standard card radius
focus:ring-gray-900  focus rings on inputs
hover:bg-gray-700    button hover
```

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `GymProfile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth` |
| API functions | camelCase | `gymOwnerApi.getMyGyms()` |
| Types/Interfaces | PascalCase | `GymOwnerDashboard` |
| CSS classes | Tailwind utilities only | `className="..."` |

### File Organization

```
pages/<role>/          One file per page
components/common/     Shared layout components (Layout, Sidebar, Toast)
components/public/     Landing page components
components/ui/         Generic UI primitives (Modal, Badge)
api/                   All API calls in one place
context/               Global state (auth)
types/                 All TypeScript types
```

### Protected Routes

```typescript
// In App.tsx — wrap with ProtectedRoute and specify allowed roles
<Route path="/admin" element={
    <ProtectedRoute roles={['ADMIN']}>
        <Layout title="Admin Panel" />
    </ProtectedRoute>
}>

// ProtectedRoute also forces /change-password if passwordChanged === false
```

---

## Git Conventions

### Branch Names
`feature/<description>`, `fix/<description>`, `chore/<description>`

### Commit Messages
```
feat: add multi-gym support for gym owners
fix: lazy-load UserDetailsService to fix startup error
chore: update CLAUDE.md and docs
```

### What NOT to commit
- `application.properties` with real credentials (use env vars)
- `node_modules/`
- `target/`
- `.env` files
