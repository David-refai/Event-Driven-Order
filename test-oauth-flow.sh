#!/bin/bash

# Manual OAuth2 Test Script

echo "=== Testing OAuth2 Flow Manually ==="
echo ""

echo "1. Testing Frontend Accessibility..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "   Frontend Status: $FRONTEND_STATUS"
echo ""

echo "2. Testing Auth Service Health..."
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/actuator/health)
echo "   Auth Service Status: $AUTH_STATUS"
echo ""

echo "3. Testing Google OAuth2 Endpoint..."
OAUTH_RESPONSE=$(curl -s -I http://localhost:8000/auth/oauth2/authorization/google | head -1)
echo "   OAuth Response: $OAUTH_RESPONSE"
echo ""

echo "4. Checking recent auth-service logs..."
docker-compose -f /Volumes/T7/AntigravityProjects/spring-boot/kafka/docker-compose.yml logs --tail=30 auth-service | grep -E "Filter:|AuthService:|OAuth|token|ERROR"
echo ""

echo "5. Instructions for Manual Test:"
echo "   a) Open http://localhost:3000 in browser"
echo "   b) Open Developer Console (F12)"
echo "   c) Click Login → Continue with Google"
echo "   d) After redirect, check:"
echo "      - Console for errors"
echo "      - Network tab for /auth/me request"
echo "      - localStorage for 'token' and 'user'"
echo "      - Does Navbar show user info?"
