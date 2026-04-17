"""
Test Suite for Stripe Subscriptions and CRM God Mode Features
Tests:
- Stripe subscription endpoints (create, upgrade, cancel, status)
- CRM admin override endpoints (override, upgrade-membership, reset-password, revoke/restore access)
- Audit logging functionality
"""
import pytest
import requests
import os
import time
from uuid import uuid4

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminAuth:
    """Admin authentication tests"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mastermeatbox.com",
            "password": "MMB@dmin2025!Secure"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return session
    
    def test_admin_login(self, admin_session):
        """Test admin can login"""
        response = admin_session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@mastermeatbox.com"
        assert data["role"] == "admin"


class TestCustomerAuth:
    """Customer authentication tests"""
    
    @pytest.fixture(scope="class")
    def test_customer(self):
        """Create a test customer for testing"""
        session = requests.Session()
        unique_email = f"test_stripe_{uuid4().hex[:8]}@example.com"
        
        # Register customer
        response = session.post(f"{BASE_URL}/api/customer/register", json={
            "email": unique_email,
            "password": "TestPass123!",
            "first_name": "Stripe",
            "last_name": "Tester"
        })
        
        if response.status_code == 200:
            data = response.json()
            return {
                "session": session,
                "token": data["token"],
                "customer": data["customer"],
                "email": unique_email
            }
        else:
            pytest.skip(f"Could not create test customer: {response.text}")
    
    def test_customer_registration(self, test_customer):
        """Test customer registration works"""
        assert test_customer["token"] is not None
        assert test_customer["customer"]["email"] == test_customer["email"]
    
    def test_customer_profile(self, test_customer):
        """Test customer can get profile"""
        response = requests.get(
            f"{BASE_URL}/api/customer/profile",
            headers={"Authorization": f"Bearer {test_customer['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["customer"]["email"] == test_customer["email"]


class TestStripeSubscriptions:
    """Stripe subscription endpoint tests"""
    
    @pytest.fixture(scope="class")
    def customer_token(self):
        """Get customer token for testing"""
        unique_email = f"stripe_test_{uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/api/customer/register", json={
            "email": unique_email,
            "password": "TestPass123!",
            "first_name": "Stripe",
            "last_name": "Test"
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Could not create customer for Stripe tests")
    
    def test_subscription_status_no_subscription(self, customer_token):
        """Test subscription status for customer without subscription"""
        response = requests.get(
            f"{BASE_URL}/api/stripe/subscription-status",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["has_subscription"] == False
        assert data["tier_level"] == 0
    
    def test_create_subscription_invalid_tier(self, customer_token):
        """Test creating subscription with invalid tier"""
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-subscription",
            json={"tier_level": 5},  # Invalid tier
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 400
        assert "Invalid tier level" in response.json()["detail"]
    
    def test_create_subscription_requires_auth(self):
        """Test subscription creation requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-subscription",
            json={"tier_level": 1}
        )
        assert response.status_code == 401
    
    def test_upgrade_subscription_no_existing(self, customer_token):
        """Test upgrading when no subscription exists"""
        response = requests.post(
            f"{BASE_URL}/api/stripe/upgrade-subscription",
            json={"tier_level": 2},
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 400
        assert "No active subscription" in response.json()["detail"]
    
    def test_cancel_subscription_no_existing(self, customer_token):
        """Test canceling when no subscription exists"""
        response = requests.post(
            f"{BASE_URL}/api/stripe/cancel-subscription",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 400
        assert "No active subscription" in response.json()["detail"]


class TestCRMGodMode:
    """CRM Admin Override (God Mode) tests"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mastermeatbox.com",
            "password": "MMB@dmin2025!Secure"
        })
        assert response.status_code == 200
        return session
    
    @pytest.fixture(scope="class")
    def test_customer_id(self, admin_session):
        """Create a test customer and return their ID"""
        unique_email = f"crm_test_{uuid4().hex[:8]}@example.com"
        
        # Register customer via customer API
        response = requests.post(f"{BASE_URL}/api/customer/register", json={
            "email": unique_email,
            "password": "TestPass123!",
            "first_name": "CRM",
            "last_name": "TestUser"
        })
        
        if response.status_code == 200:
            return response.json()["customer"]["id"]
        
        # Fallback: get existing customer
        response = admin_session.get(f"{BASE_URL}/api/customers")
        if response.status_code == 200:
            customers = response.json()
            if customers:
                return customers[0]["id"]
        
        pytest.skip("Could not get test customer ID")
    
    def test_admin_can_list_customers(self, admin_session):
        """Test admin can list all customers"""
        response = admin_session.get(f"{BASE_URL}/api/customers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_admin_override_customer_data(self, admin_session, test_customer_id):
        """Test admin can override customer data"""
        response = admin_session.put(
            f"{BASE_URL}/api/admin/customers/{test_customer_id}/override",
            json={
                "first_name": "AdminOverride",
                "phone": "555-123-4567",
                "city": "Test City"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "Customer updated successfully" in data["message"]
        assert "first_name" in data["changes_made"]
        
        # Verify the change persisted
        customer = data["customer"]
        assert customer["first_name"] == "AdminOverride"
        assert customer["phone"] == "555-123-4567"
    
    def test_admin_override_empty_data(self, admin_session, test_customer_id):
        """Test admin override with no fields fails"""
        response = admin_session.put(
            f"{BASE_URL}/api/admin/customers/{test_customer_id}/override",
            json={}
        )
        assert response.status_code == 400
        assert "No fields to update" in response.json()["detail"]
    
    def test_admin_upgrade_membership(self, admin_session, test_customer_id):
        """Test admin can force upgrade membership"""
        response = admin_session.post(
            f"{BASE_URL}/api/admin/customers/{test_customer_id}/upgrade-membership",
            params={"new_tier": 2}  # Prime tier
        )
        assert response.status_code == 200
        data = response.json()
        assert data["new_tier"] == 2
        assert "Prime" in data["message"]
    
    def test_admin_upgrade_invalid_tier(self, admin_session, test_customer_id):
        """Test admin upgrade with invalid tier fails"""
        response = admin_session.post(
            f"{BASE_URL}/api/admin/customers/{test_customer_id}/upgrade-membership",
            params={"new_tier": 5}  # Invalid tier
        )
        assert response.status_code == 400
        assert "Invalid tier level" in response.json()["detail"]
    
    def test_admin_reset_password(self, admin_session, test_customer_id):
        """Test admin can reset customer password"""
        response = admin_session.post(
            f"{BASE_URL}/api/admin/customers/{test_customer_id}/reset-password",
            json={"new_password": "NewTempPass123!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "Password reset successfully" in data["message"]
        assert data["temporary_password"] == "NewTempPass123!"
    
    def test_admin_reset_password_short(self, admin_session, test_customer_id):
        """Test admin reset with short password (backend should accept, frontend validates)"""
        response = admin_session.post(
            f"{BASE_URL}/api/admin/customers/{test_customer_id}/reset-password",
            json={"new_password": "abc"}  # Short password
        )
        # Backend accepts any password, frontend validates length
        assert response.status_code == 200
    
    def test_admin_revoke_access(self, admin_session, test_customer_id):
        """Test admin can revoke customer access"""
        response = admin_session.delete(
            f"{BASE_URL}/api/admin/customers/{test_customer_id}/revoke-access"
        )
        assert response.status_code == 200
        data = response.json()
        assert "access revoked" in data["message"].lower()
    
    def test_admin_restore_access(self, admin_session, test_customer_id):
        """Test admin can restore customer access"""
        response = admin_session.post(
            f"{BASE_URL}/api/admin/customers/{test_customer_id}/restore-access"
        )
        assert response.status_code == 200
        data = response.json()
        assert "access restored" in data["message"].lower()
    
    def test_admin_view_audit_log(self, admin_session, test_customer_id):
        """Test admin can view customer audit log"""
        response = admin_session.get(
            f"{BASE_URL}/api/admin/customers/{test_customer_id}/audit-log"
        )
        assert response.status_code == 200
        data = response.json()
        assert "actions" in data
        assert data["customer_id"] == test_customer_id
        # Should have actions from previous tests
        assert data["total_actions"] > 0
    
    def test_admin_view_recent_actions(self, admin_session):
        """Test admin can view recent admin actions"""
        response = admin_session.get(
            f"{BASE_URL}/api/admin/customers/audit-log/recent"
        )
        assert response.status_code == 200
        data = response.json()
        assert "actions" in data
        assert isinstance(data["actions"], list)
    
    def test_admin_override_nonexistent_customer(self, admin_session):
        """Test admin override on non-existent customer fails"""
        response = admin_session.put(
            f"{BASE_URL}/api/admin/customers/nonexistent-id-12345/override",
            json={"first_name": "Test"}
        )
        assert response.status_code == 404
        assert "Customer not found" in response.json()["detail"]


class TestAuditLogging:
    """Audit logging verification tests"""
    
    @pytest.fixture(scope="class")
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mastermeatbox.com",
            "password": "MMB@dmin2025!Secure"
        })
        assert response.status_code == 200
        return session
    
    def test_audit_log_contains_admin_email(self, admin_session):
        """Test audit logs contain admin email"""
        # Create a customer and perform an action
        unique_email = f"audit_test_{uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/api/customer/register", json={
            "email": unique_email,
            "password": "TestPass123!",
            "first_name": "Audit",
            "last_name": "Test"
        })
        
        if response.status_code != 200:
            pytest.skip("Could not create test customer")
        
        customer_id = response.json()["customer"]["id"]
        
        # Perform admin action
        admin_session.put(
            f"{BASE_URL}/api/admin/customers/{customer_id}/override",
            json={"first_name": "AuditVerify"}
        )
        
        # Check audit log
        response = admin_session.get(
            f"{BASE_URL}/api/admin/customers/{customer_id}/audit-log"
        )
        assert response.status_code == 200
        data = response.json()
        
        if data["total_actions"] > 0:
            latest_action = data["actions"][0]
            assert "admin_email" in latest_action
            assert latest_action["admin_email"] == "admin@mastermeatbox.com"
            assert "timestamp" in latest_action
            assert "changes" in latest_action


class TestStripeWebhook:
    """Stripe webhook endpoint tests"""
    
    def test_webhook_invalid_payload(self):
        """Test webhook rejects invalid payload"""
        response = requests.post(
            f"{BASE_URL}/api/stripe/webhook",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        # Should return 400 for invalid payload
        assert response.status_code in [400, 422]
    
    def test_webhook_missing_signature(self):
        """Test webhook handles missing signature"""
        response = requests.post(
            f"{BASE_URL}/api/stripe/webhook",
            json={"type": "test.event"},
            headers={"Content-Type": "application/json"}
        )
        # Without proper signature, should fail or handle gracefully
        assert response.status_code in [200, 400]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
