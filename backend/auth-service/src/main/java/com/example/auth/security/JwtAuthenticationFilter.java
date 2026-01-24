package com.example.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        System.out.println("Filter: Request to " + request.getRequestURI() + " from " + request.getRemoteAddr());
        try {
            String jwt = getJwtFromRequest(request);
            System.out.println(
                    "Filter: Extracted JWT: " + (jwt != null ? "Present (length: " + jwt.length() + ")" : "NULL"));

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                System.out.println("Filter: JWT is valid");
                String username = tokenProvider.getUsernameFromToken(jwt);
                System.out.println("Filter: Username from JWT: " + username);

                // Extract roles from JWT claims
                // Note: Auth Service JwtTokenProvider stores roles as a comma-separated String
                // in "roles" claim
                io.jsonwebtoken.Claims claims = io.jsonwebtoken.Jwts.parser()
                        .verifyWith(tokenProvider.getSigningKey())
                        .build()
                        .parseSignedClaims(jwt)
                        .getPayload();

                String rolesString = claims.get("roles", String.class);
                System.out.println("Filter: Roles from JWT: " + rolesString);
                List<SimpleGrantedAuthority> authorities = Arrays.stream(rolesString.split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username,
                        null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("Filter: Authentication set in SecurityContext for user: " + username);
            } else {
                System.out.println("Filter: JWT is invalid or not present");
            }
        } catch (Exception ex) {
            System.err.println("Filter: Error processing JWT: " + ex.getMessage());
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        // Fallback to token query parameter for SSE/EventSource
        String tokenParam = request.getParameter("token");
        if (StringUtils.hasText(tokenParam)) {
            return tokenParam;
        }
        return null;
    }
}
