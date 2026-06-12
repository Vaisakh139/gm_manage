package com.gymmanagement.gym_management.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Logs every inbound HTTP request and its corresponding response.
 *
 * <p>Log format (request):</p>
 * <pre>→ POST  /api/auth/login          [IP: 127.0.0.1] [user: anonymous]</pre>
 *
 * <p>Log format (response):</p>
 * <pre>← POST  /api/auth/login          [200]  12ms</pre>
 *
 * <p>{@code @Order(1)} ensures this filter runs before Spring Security's chain so
 * every request is captured, including rejected ones.</p>
 */
@Component
@Order(1)
@Slf4j
public class LoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        String method = request.getMethod();
        String uri    = request.getRequestURI();
        String query  = request.getQueryString();
        String fullUri = query != null ? uri + "?" + query : uri;
        String ip     = getClientIp(request);

        // Log the incoming request — user may not be authenticated yet at this point
        log.info("→ {:<6} {:<45} [IP: {}]", method, fullUri, ip);

        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int  status   = response.getStatus();
            String user   = resolveUser();

            // Choose log level based on HTTP status code
            if (status >= 500) {
                log.error("← {:<6} {:<45} [{}] [user: {}] {}ms",
                        method, fullUri, status, user, duration);
            } else if (status >= 400) {
                log.warn("← {:<6} {:<45} [{}] [user: {}] {}ms",
                        method, fullUri, status, user, duration);
            } else {
                log.info("← {:<6} {:<45} [{}] [user: {}] {}ms",
                        method, fullUri, status, user, duration);
            }
        }
    }

    /** Extract the real client IP, respecting reverse-proxy headers */
    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }
        return request.getRemoteAddr();
    }

    /** Return the authenticated user's email, or "anonymous" */
    private String resolveUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return "anonymous";
        }
        return auth.getName();
    }
}
