#!/bin/bash

# 1. Register a user intended to be admin
echo "Registering admin candidate..."
curl -s -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","email":"admin@example.com","password":"password123"}'

# 2. Get the User ID (assuming it's the latest one or querying DB)
echo "Promoting to ADMIN via SQL..."
docker exec kafka-postgres-1 psql -U user -d auth_db -c "INSERT INTO user_roles (user_id, role_id) VALUES ((SELECT id FROM users WHERE username='superadmin'), 2) ON CONFLICT DO NOTHING;"

# 3. Login as Admin
echo "Logging in as Admin..."
RESPONSE=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"password123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Admin Token Acquired."

# 4. Test List Users (Admin Only)
echo "Testing GET /users..."
curl -s -X GET http://localhost:8000/users \
  -H "Authorization: Bearer $TOKEN" | grep "superadmin" && echo "✅ User List Working" || echo "❌ User List Failed"

# 5. Test List Orders (Admin Only)
echo "Testing GET /api/orders/admin/all..."
curl -s -X GET http://localhost:8000/api/orders/admin/all \
  -H "Authorization: Bearer $TOKEN" && echo "✅ Order List Working" || echo "❌ Order List Failed"
