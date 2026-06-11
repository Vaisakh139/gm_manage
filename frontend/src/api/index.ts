/**
 * Barrel export — import everything from 'src/api' instead of
 * reaching into sub-files directly.
 *
 * Usage:
 *   import { adminApi, gymOwnerApi, memberApi } from '../../api';
 */
export { default } from './axios';
export { authApi, publicApi, adminApi, gymOwnerApi, memberApi } from './axios';
export { applyInterceptors } from './interceptors';
