// ── Legacy file — all exports now live in src/api/axios.ts ──
// This file is kept as a re-export shim so any leftover import
// still resolves without a compile error.
export { default, authApi, publicApi, adminApi, gymOwnerApi, memberApi } from './api/axios';
