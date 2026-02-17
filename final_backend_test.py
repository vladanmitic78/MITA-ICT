#!/usr/bin/env python3
"""
Final Comprehensive Backend Test for MITA ICT
Focus: Admin Authentication and Critical API Functionality
"""

import requests
import json
import time

BASE_URL = "https://mita-stable.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_complete_admin_flow():
    """Test complete admin authentication flow"""
    print("🔐 Testing Complete Admin Authentication Flow...")
    
    session = requests.Session()
    
    # Step 1: Login
    login_response = session.post(
        f"{API_BASE}/admin/login",
        json={"username": "admin", "password": "admin123"},
        headers={"Content-Type": "application/json"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False
    
    token_data = login_response.json()
    access_token = token_data.get("access_token")
    
    if not access_token:
        print("❌ No access token received")
        return False
    
    print(f"✅ Login successful, token received (length: {len(access_token)})")
    
    # Step 2: Test protected endpoint
    headers = {"Authorization": f"Bearer {access_token}"}
    contacts_response = session.get(f"{API_BASE}/admin/contacts", headers=headers)
    
    if contacts_response.status_code != 200:
        print(f"❌ Protected endpoint failed: {contacts_response.status_code}")
        return False
    
    contacts = contacts_response.json()
    print(f"✅ Protected endpoint working, retrieved {len(contacts)} contacts")
    
    # Step 3: Test logout
    logout_response = session.post(f"{API_BASE}/admin/logout", headers=headers)
    
    if logout_response.status_code != 200:
        print(f"❌ Logout failed: {logout_response.status_code}")
        return False
    
    print("✅ Logout successful")
    
    return True

def test_public_endpoints():
    """Test all public endpoints"""
    print("\n🌐 Testing Public Endpoints...")
    
    endpoints = [
        ("/", "Root"),
        ("/services", "Services"),
        ("/saas-products", "SaaS Products"),
        ("/about", "About")
    ]
    
    all_passed = True
    
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"✅ {name}: {len(data)} items")
                elif isinstance(data, dict):
                    print(f"✅ {name}: Data retrieved")
                else:
                    print(f"✅ {name}: Response received")
            else:
                print(f"❌ {name}: Status {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"❌ {name}: Error - {e}")
            all_passed = False
    
    return all_passed

def test_error_scenarios():
    """Test error handling scenarios"""
    print("\n⚠️ Testing Error Scenarios...")
    
    # Test invalid login
    invalid_login = requests.post(
        f"{API_BASE}/admin/login",
        json={"username": "wrong", "password": "wrong"}
    )
    
    if invalid_login.status_code == 401:
        print("✅ Invalid login correctly rejected (401)")
    else:
        print(f"❌ Invalid login: Expected 401, got {invalid_login.status_code}")
        return False
    
    # Test protected endpoint without token
    no_token = requests.get(f"{API_BASE}/admin/contacts")
    
    if no_token.status_code in [401, 403]:  # Both are acceptable
        print(f"✅ Protected endpoint without token correctly rejected ({no_token.status_code})")
    else:
        print(f"❌ Protected endpoint without token: Expected 401/403, got {no_token.status_code}")
        return False
    
    # Test invalid endpoint
    not_found = requests.get(f"{API_BASE}/invalid-endpoint")
    
    if not_found.status_code == 404:
        print("✅ Invalid endpoint correctly returns 404")
    else:
        print(f"❌ Invalid endpoint: Expected 404, got {not_found.status_code}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🚀 MITA ICT Backend - Final Comprehensive Test")
    print(f"📍 Testing: {BASE_URL}")
    print("=" * 60)
    
    results = []
    
    # Test admin flow
    admin_flow_result = test_complete_admin_flow()
    results.append(("Admin Authentication Flow", admin_flow_result))
    
    # Test public endpoints
    public_endpoints_result = test_public_endpoints()
    results.append(("Public Endpoints", public_endpoints_result))
    
    # Test error scenarios
    error_scenarios_result = test_error_scenarios()
    results.append(("Error Handling", error_scenarios_result))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 FINAL TEST SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if not result:
            all_passed = False
    
    print(f"\nOverall Result: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    if all_passed:
        print("\n🎉 Backend is working correctly!")
        print("✅ Admin login flow is functional")
        print("✅ Authentication system is working")
        print("✅ Public endpoints are accessible")
        print("✅ Error handling is appropriate")
        print("\n💡 The reported desktop browser issue is likely on the frontend side.")
    else:
        print("\n⚠️ Some backend issues detected. Check the details above.")
    
    return all_passed

if __name__ == "__main__":
    main()