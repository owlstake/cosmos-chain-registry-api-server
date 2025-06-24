#!/bin/bash

# Test script for Admin Authentication
echo "🔐 Testing Admin Authentication for Sync Endpoint"
echo "================================================"

# Configuration
API_URL="http://localhost:3000"
ADMIN_API_KEY="cosmos-dev-admin-key-123"
WRONG_API_KEY="wrong-key-123"

echo ""
echo "1. Testing sync WITHOUT API key (should fail with 401):"
echo "--------------------------------------------------------"
curl -X POST "$API_URL/v1/sync" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s --connect-timeout 5 || echo "❌ Connection failed - make sure server is running"

echo ""
echo "2. Testing sync with WRONG API key (should fail with 401):"
echo "---------------------------------------------------------"
curl -X POST "$API_URL/v1/sync" \
  -H "X-API-Key: $WRONG_API_KEY" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s --connect-timeout 5 || echo "❌ Connection failed"

echo ""
echo "3. Testing sync with CORRECT API key (should work or rate limit):"
echo "----------------------------------------------------------------"
curl -X POST "$API_URL/v1/sync" \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s --connect-timeout 5 || echo "❌ Connection failed"

echo ""
echo "4. Testing regular API (should work without auth):"
echo "-------------------------------------------------"
curl "$API_URL/health" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s --connect-timeout 5 || echo "❌ Connection failed"

echo ""
echo "5. Testing chains endpoint (should work without auth):"
echo "----------------------------------------------------"
curl "$API_URL/v1/chains?limit=5" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s --connect-timeout 5 || echo "❌ Connection failed"

echo ""
echo "📋 Test Summary:"
echo "================="
echo "✅ Tests 1-2 should return HTTP 401 (Unauthorized)"
echo "✅ Test 3 should return HTTP 200 (Success) or 429 (Rate Limited)"  
echo "✅ Tests 4-5 should return HTTP 200 (Success)"
echo ""
echo "🔐 Admin Authentication Features:"
echo "- API Key required for /v1/sync endpoint"
echo "- IP whitelist protection (configure ADMIN_IPS)"
echo "- All admin attempts logged with IP and timestamp"
echo "- Regular API endpoints work without authentication"
