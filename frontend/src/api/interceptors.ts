import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';

// ─── Augment InternalAxiosRequestConfig to carry timing metadata ─────────────
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
//
// Runs before every outgoing request.
// Responsibilities:
//   1. Attach the JWT stored in localStorage as an Authorization header.
//   2. Record a startTime timestamp so response time can be calculated.
// ─────────────────────────────────────────────────────────────────────────────
function requestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  // 1 ── JWT attachment ───────────────────────────────────────────────────────
  //      Public routes (/auth/** and /public/**) still receive this header but
  //      the backend's SecurityConfig has them in permitAll() and ignores it.
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2 ── Request timestamp ────────────────────────────────────────────────────
  //      Visible in DevTools Network tab via the config object.
  config.metadata = { startTime: Date.now() };

  return config;
}

function requestErrorInterceptor(error: unknown): Promise<never> {
  // If the interceptor itself fails (rare — e.g. config serialisation error),
  // reject immediately so the caller receives a proper error instead of hanging.
  return Promise.reject(error);
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
//
// Runs after every response — both successful (2xx) and failed (4xx / 5xx).
// Responsibilities:
//   • Log response time.
//   • On 401 → clear credentials and force redirect to /login.
//   • On 403 → warn; let the component show the permission message.
//   • On network failure → surface a friendly message.
//   • All errors are always re-rejected so component .catch() blocks still run.
// ─────────────────────────────────────────────────────────────────────────────
function responseSuccessInterceptor(response: ReturnType<typeof Object>) {
  // Log how long the request took (visible in DevTools console)
  const config = response.config as InternalAxiosRequestConfig;
  if (config.metadata?.startTime) {
    const elapsed = Date.now() - config.metadata.startTime;
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url} → ${response.status} (${elapsed}ms)`);
  }
  return response;
}

function responseErrorInterceptor(error: AxiosError<ApiResponse<unknown>>): Promise<never> {
  // ── No response at all → network is down or server unreachable ─────────────
  if (!error.response) {
    console.error('[API] Network error — server may be unreachable:', error.message);
    return Promise.reject(
      new Error('Unable to reach the server. Please check your internet connection.')
    );
  }

  const { status, data, config } = error.response;
  const url = config?.url ?? 'unknown';

  switch (status) {
    // ── 401 Unauthenticated ──────────────────────────────────────────────────
    //    Token is missing, expired, or invalid.
    //    Clear all stored credentials and send the user back to /login.
    //    Use window.location.replace so the login page doesn't appear in the
    //    browser history (prevents the back-button from looping to a 401 page).
    case 401:
      console.warn('[API] 401 — session expired or unauthenticated. Redirecting to /login.');
      localStorage.clear();
      window.location.replace('/login');
      break;

    // ── 403 Forbidden ────────────────────────────────────────────────────────
    //    The user IS authenticated but lacks the required role.
    //    Do NOT log out — let the component show an "Access denied" message.
    case 403:
      console.warn(`[API] 403 Forbidden — insufficient permissions for ${url}`);
      break;

    // ── 404 Not Found ────────────────────────────────────────────────────────
    case 404:
      console.warn(`[API] 404 Not Found — ${url}`);
      break;

    // ── 400 / 422 Validation ─────────────────────────────────────────────────
    //    Field-level errors — the calling component handles these.
    case 400:
    case 422:
      console.warn(`[API] ${status} Validation error on ${url}:`, data?.message);
      break;

    // ── 500 Internal Server Error ────────────────────────────────────────────
    case 500:
      console.error(`[API] 500 Server error on ${url}:`, data?.message);
      break;

    // ── Anything else ────────────────────────────────────────────────────────
    default:
      console.error(`[API] Unexpected status ${status} on ${url}:`, data);
  }

  // Always re-reject so every .catch() at the call-site still executes.
  return Promise.reject(error);
}

// ─────────────────────────────────────────────────────────────────────────────
// applyInterceptors
//
// Call this once after creating the Axios instance to wire up both interceptors.
// Keeping this in a separate file means:
//   • interceptors.ts can be unit-tested in isolation
//   • axios.ts stays focused on the instance config and endpoint groups
// ─────────────────────────────────────────────────────────────────────────────
export function applyInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
  instance.interceptors.response.use(responseSuccessInterceptor as never, responseErrorInterceptor);
}
