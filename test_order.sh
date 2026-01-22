#!/bin/bash
TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlcl9oczI1Nl92NCIsInJvbGVzIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzY5MTA0NzI5LCJleHAiOjE3NjkxMDUwMjl9.hwp_BgzT0KORBJDHrezEwrlo-MrRs0FZlxS43cxJuHs"
curl -v -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"customerId":"customer1","totalAmount":100.50,"currency":"USD","items":[{"productId":"prod1","quantity":2,"price":50.25}]}'
