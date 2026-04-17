"""
Customer Portal and Membership Security Tests
Tests for:
1. Customer registration and login
2. Customer profile management (GET/PUT with Bearer token)
3. Membership endpoint security (POST/PUT/DELETE require auth)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data
TEST_CUSTOMER_EMAIL = f"test_customer_{uuid.uuid4().hex[:8]}@example.com"
TEST_CUSTOMER_PASSWORD = "TestPass123!"
TEST_CUSTOMER_FIRST_NAME = "Test"
TEST_CUSTOMER_LAST_NAME = "Customer"

class TestMembershipSecurity:
    """CRITICAL: Membership endpoints must require authentication for modifications"""
    
    def test_get_memberships_public(self):
        """GET /api/memberships should be public (no auth required)"""
        response = requests.get(f"{BASE_URL}/api/memberships")
        assert response.status_code == 200, f"GET memberships should be public, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return list of memberships"
        print(f"✓ GET /api/memberships is public - returned {len(data)} memberships")
    
    def test_post_membership_requires_auth(self):
        """POST /api/memberships should require authentication"""
        payload = {
            "tier_name": "TEST_Unauthorized",
            "tier_level": 99,
            "monthly_price": 1.0,
            "yearly_price": 10.0,
            "description": "Test tier",
            "features": [],
            "highlight": False,
            "best_value": False,
            "benefits": {
                "discount_percent": 0,
                "select_steaks_discount": 0,
                "a5_wagyu_discount": 0,
                "custom_dry_aging": False,
                "dry_aging_days": 0,
                "vip_cut_eligible": False,
                "vip_cut_threshold": 150,
                "birthday_bonus": False,
                "concierge_access": False,
                "early_access": False,
                "priority_delivery": False,
                "delivery": {
                    "base_free_miles": 0,
                    "extended_free_miles": 0,
                    "order_threshold": 0,
                    "local_discount_percent": None,
                    "local_discount_max_miles": None
                }
            }
        }
        response = requests.post(
            f"{BASE_URL}/api/memberships",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 401, f"POST memberships without auth should return 401, got {response.status_code}"
        print("✓ POST /api/memberships requires authentication (401)")
    
    def test_put_membership_requires_auth(self):
        """PUT /api/memberships/:id should require authentication"""
        response = requests.put(
            f"{BASE_URL}/api/memberships/test-id",
            json={"tier_name": "TEST_Unauthorized"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 401, f"PUT memberships without auth should return 401, got {response.status_code}"
        print("✓ PUT /api/memberships/:id requires authentication (401)")
    
    def test_delete_membership_requires_auth(self):
        """DELETE /api/memberships/:id should require authentication"""
        response = requests.delete(f"{BASE_URL}/api/memberships/test-id")
        assert response.status_code == 401, f"DELETE memberships without auth should return 401, got {response.status_code}"
        print("✓ DELETE /api/memberships/:id requires authentication (401)")


class TestCustomerRegistration:
    """Customer registration flow tests"""
    
    def test_register_new_customer(self):
        """POST /api/customer/register should create new customer and return token"""
        payload = {
            "email": TEST_CUSTOMER_EMAIL,
            "password": TEST_CUSTOMER_PASSWORD,
            "first_name": TEST_CUSTOMER_FIRST_NAME,
            "last_name": TEST_CUSTOMER_LAST_NAME
        }
        response = requests.post(
            f"{BASE_URL}/api/customer/register",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Registration should succeed, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "token" in data, "Response should contain token"
        assert "customer" in data, "Response should contain customer data"
        assert data["customer"]["email"] == TEST_CUSTOMER_EMAIL
        assert data["customer"]["first_name"] == TEST_CUSTOMER_FIRST_NAME
        assert data["customer"]["last_name"] == TEST_CUSTOMER_LAST_NAME
        assert data["customer"]["membership_tier"] == 0, "New customers should have Free tier (0)"
        
        print(f"✓ Customer registration successful - email: {TEST_CUSTOMER_EMAIL}")
        return data["token"]
    
    def test_register_duplicate_email_fails(self):
        """POST /api/customer/register with existing email should fail"""
        # First register
        payload = {
            "email": f"duplicate_{uuid.uuid4().hex[:8]}@example.com",
            "password": TEST_CUSTOMER_PASSWORD,
            "first_name": "Duplicate",
            "last_name": "Test"
        }
        response1 = requests.post(f"{BASE_URL}/api/customer/register", json=payload)
        assert response1.status_code == 200
        
        # Try to register again with same email
        response2 = requests.post(f"{BASE_URL}/api/customer/register", json=payload)
        assert response2.status_code == 400, f"Duplicate registration should fail with 400, got {response2.status_code}"
        assert "already registered" in response2.json().get("detail", "").lower()
        print("✓ Duplicate email registration correctly rejected (400)")


class TestCustomerLogin:
    """Customer login flow tests"""
    
    @pytest.fixture(autouse=True)
    def setup_customer(self):
        """Create a test customer for login tests"""
        self.test_email = f"login_test_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "LoginTest123!"
        
        # Register customer
        response = requests.post(
            f"{BASE_URL}/api/customer/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "first_name": "Login",
                "last_name": "Test"
            }
        )
        assert response.status_code == 200, f"Setup failed: {response.text}"
    
    def test_login_success(self):
        """POST /api/customer/login with valid credentials should return token"""
        response = requests.post(
            f"{BASE_URL}/api/customer/login",
            json={"email": self.test_email, "password": self.test_password}
        )
        assert response.status_code == 200, f"Login should succeed, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "token" in data, "Response should contain token"
        assert "customer" in data, "Response should contain customer data"
        assert data["customer"]["email"] == self.test_email
        print(f"✓ Customer login successful - email: {self.test_email}")
    
    def test_login_wrong_password(self):
        """POST /api/customer/login with wrong password should fail"""
        response = requests.post(
            f"{BASE_URL}/api/customer/login",
            json={"email": self.test_email, "password": "WrongPassword123!"}
        )
        assert response.status_code == 401, f"Wrong password should return 401, got {response.status_code}"
        print("✓ Login with wrong password correctly rejected (401)")
    
    def test_login_nonexistent_email(self):
        """POST /api/customer/login with non-existent email should fail"""
        response = requests.post(
            f"{BASE_URL}/api/customer/login",
            json={"email": "nonexistent@example.com", "password": "AnyPassword123!"}
        )
        assert response.status_code == 401, f"Non-existent email should return 401, got {response.status_code}"
        print("✓ Login with non-existent email correctly rejected (401)")


class TestCustomerProfile:
    """Customer profile management tests"""
    
    @pytest.fixture(autouse=True)
    def setup_authenticated_customer(self):
        """Create and authenticate a test customer"""
        self.test_email = f"profile_test_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "ProfileTest123!"
        
        # Register customer
        response = requests.post(
            f"{BASE_URL}/api/customer/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "first_name": "Profile",
                "last_name": "Test"
            }
        )
        assert response.status_code == 200, f"Setup failed: {response.text}"
        self.token = response.json()["token"]
        self.auth_headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_profile_requires_auth(self):
        """GET /api/customer/profile without token should fail"""
        response = requests.get(f"{BASE_URL}/api/customer/profile")
        assert response.status_code == 401, f"Profile without auth should return 401, got {response.status_code}"
        print("✓ GET /api/customer/profile requires authentication (401)")
    
    def test_get_profile_with_token(self):
        """GET /api/customer/profile with valid token should return profile"""
        response = requests.get(
            f"{BASE_URL}/api/customer/profile",
            headers=self.auth_headers
        )
        assert response.status_code == 200, f"Profile fetch should succeed, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "customer" in data, "Response should contain customer data"
        assert data["customer"]["email"] == self.test_email
        assert data["customer"]["first_name"] == "Profile"
        assert data["customer"]["last_name"] == "Test"
        print(f"✓ GET /api/customer/profile returns correct data")
    
    def test_update_profile_requires_auth(self):
        """PUT /api/customer/profile without token should fail"""
        response = requests.put(
            f"{BASE_URL}/api/customer/profile",
            json={"first_name": "Updated"}
        )
        assert response.status_code == 401, f"Profile update without auth should return 401, got {response.status_code}"
        print("✓ PUT /api/customer/profile requires authentication (401)")
    
    def test_update_profile_with_token(self):
        """PUT /api/customer/profile with valid token should update profile"""
        update_data = {
            "first_name": "UpdatedFirst",
            "last_name": "UpdatedLast",
            "phone": "(555) 123-4567",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "TX",
            "zip_code": "12345"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/customer/profile",
            json=update_data,
            headers=self.auth_headers
        )
        assert response.status_code == 200, f"Profile update should succeed, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["customer"]["first_name"] == "UpdatedFirst"
        assert data["customer"]["last_name"] == "UpdatedLast"
        assert data["customer"]["phone"] == "(555) 123-4567"
        assert data["customer"]["city"] == "Test City"
        print("✓ PUT /api/customer/profile updates correctly")
        
        # Verify persistence with GET
        get_response = requests.get(
            f"{BASE_URL}/api/customer/profile",
            headers=self.auth_headers
        )
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["customer"]["first_name"] == "UpdatedFirst"
        print("✓ Profile update persisted correctly")
    
    def test_cannot_update_email(self):
        """PUT /api/customer/profile should not allow email change"""
        response = requests.put(
            f"{BASE_URL}/api/customer/profile",
            json={"email": "hacker@example.com"},
            headers=self.auth_headers
        )
        # Should succeed but email should not change
        assert response.status_code == 200
        
        # Verify email unchanged
        get_response = requests.get(
            f"{BASE_URL}/api/customer/profile",
            headers=self.auth_headers
        )
        assert get_response.json()["customer"]["email"] == self.test_email
        print("✓ Email cannot be changed via profile update")
    
    def test_cannot_update_membership_tier(self):
        """PUT /api/customer/profile should not allow membership_tier change"""
        response = requests.put(
            f"{BASE_URL}/api/customer/profile",
            json={"membership_tier": 3},
            headers=self.auth_headers
        )
        # Should succeed but tier should not change
        assert response.status_code == 200
        
        # Verify tier unchanged
        get_response = requests.get(
            f"{BASE_URL}/api/customer/profile",
            headers=self.auth_headers
        )
        assert get_response.json()["customer"]["membership_tier"] == 0
        print("✓ Membership tier cannot be changed via profile update")


class TestCustomerLogout:
    """Customer logout tests"""
    
    def test_logout_endpoint(self):
        """POST /api/customer/logout should return success"""
        response = requests.post(f"{BASE_URL}/api/customer/logout")
        assert response.status_code == 200, f"Logout should succeed, got {response.status_code}"
        assert "message" in response.json()
        print("✓ POST /api/customer/logout returns success")


class TestExistingCustomer:
    """Test with existing customer credentials from test_credentials.md"""
    
    def test_login_jane_smith(self):
        """Test login with jane.smith@example.com if exists"""
        response = requests.post(
            f"{BASE_URL}/api/customer/login",
            json={"email": "jane.smith@example.com", "password": "TestPass123!"}
        )
        # This may fail if customer doesn't exist - that's OK
        if response.status_code == 200:
            print("✓ jane.smith@example.com login successful")
        else:
            print(f"ℹ jane.smith@example.com not found or wrong password (expected if not seeded)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
