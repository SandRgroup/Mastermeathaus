"""
Test BBQ Planner Features:
- Per-steak grade selection
- Per-steak dry aging selection (flat pricing)
- BBQ Settings API (event type portions)
- Admin authentication for settings update
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@mastermeatbox.com"
ADMIN_PASSWORD = "MMB@dmin2025!Secure"


class TestBBQSettingsAPI:
    """Test BBQ Settings endpoint for event type portions"""
    
    def test_get_bbq_settings_public(self):
        """GET /api/bbq-settings should be public (no auth required)"""
        response = requests.get(f"{BASE_URL}/api/bbq-settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "event_type_portions" in data, "Response should contain event_type_portions"
        
        portions = data["event_type_portions"]
        # Verify all event types exist
        assert "luxury" in portions, "Should have luxury portion"
        assert "family" in portions, "Should have family portion"
        assert "party" in portions, "Should have party portion"
        assert "casual" in portions, "Should have casual portion"
        
        # Verify values are positive numbers
        for event_type, value in portions.items():
            assert isinstance(value, (int, float)), f"{event_type} should be a number"
            assert value > 0, f"{event_type} should be positive"
        
        print(f"✅ BBQ Settings returned: {portions}")
    
    def test_update_bbq_settings_requires_auth(self):
        """PUT /api/bbq-settings should require authentication"""
        response = requests.put(
            f"{BASE_URL}/api/bbq-settings",
            json={"event_type_portions": {"luxury": 1.5, "family": 1.2, "party": 1.0, "casual": 1.3}}
        )
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✅ BBQ Settings update correctly requires authentication")
    
    def test_update_bbq_settings_with_auth(self):
        """PUT /api/bbq-settings should work with admin auth"""
        # Login first
        session = requests.Session()
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        
        # Update settings
        new_portions = {"luxury": 1.4, "family": 1.15, "party": 1.05, "casual": 1.25}
        update_response = session.put(
            f"{BASE_URL}/api/bbq-settings",
            json={"event_type_portions": new_portions}
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify update persisted
        get_response = requests.get(f"{BASE_URL}/api/bbq-settings")
        assert get_response.status_code == 200
        data = get_response.json()
        
        for event_type, expected_value in new_portions.items():
            actual_value = data["event_type_portions"].get(event_type)
            assert actual_value == expected_value, f"{event_type}: expected {expected_value}, got {actual_value}"
        
        print(f"✅ BBQ Settings updated and persisted: {data['event_type_portions']}")
        
        # Restore defaults
        default_portions = {"luxury": 1.3, "family": 1.1, "party": 1.0, "casual": 1.2}
        session.put(
            f"{BASE_URL}/api/bbq-settings",
            json={"event_type_portions": default_portions}
        )
        print("✅ Restored default portions")


class TestBBQProductsAPI:
    """Test BBQ Products endpoint"""
    
    def test_get_bbq_products(self):
        """GET /api/bbq-products should return products with correct structure"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        products = response.json()
        assert isinstance(products, list), "Response should be a list"
        assert len(products) > 0, "Should have at least one product"
        
        # Check for steak products
        steak_products = [p for p in products if 'steak' in p.get('name', '').lower()]
        non_steak_products = [p for p in products if 'steak' not in p.get('name', '').lower()]
        
        print(f"✅ Found {len(steak_products)} steak products and {len(non_steak_products)} non-steak products")
        
        # Verify product structure
        for product in products[:3]:  # Check first 3
            assert "id" in product, "Product should have id"
            assert "name" in product, "Product should have name"
            assert "basePrice" in product, "Product should have basePrice"
            assert "meatType" in product, "Product should have meatType"
        
        print(f"✅ BBQ Products API returned {len(products)} products with correct structure")
    
    def test_steak_products_exist(self):
        """Verify steak products exist for grade/aging selection"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        assert response.status_code == 200
        
        products = response.json()
        steak_products = [p for p in products if 'steak' in p.get('name', '').lower()]
        
        assert len(steak_products) > 0, "Should have at least one steak product"
        
        steak_names = [p['name'] for p in steak_products]
        print(f"✅ Found steak products: {steak_names}")
    
    def test_non_steak_products_exist(self):
        """Verify non-steak products exist (chicken, pork, lamb)"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        assert response.status_code == 200
        
        products = response.json()
        
        # Check for different meat types
        meat_types = set(p.get('meatType', '') for p in products)
        print(f"✅ Found meat types: {meat_types}")
        
        # Should have more than just beef
        assert len(meat_types) > 1, "Should have multiple meat types"


class TestAuthAPI:
    """Test authentication endpoints"""
    
    def test_admin_login(self):
        """Test admin login with correct credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "email" in data, "Response should contain email"
        assert data["email"] == ADMIN_EMAIL, "Email should match"
        assert data.get("role") == "admin", "Role should be admin"
        
        print(f"✅ Admin login successful: {data['email']}")
    
    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Wrong password correctly rejected")
    
    def test_auth_me_without_token(self):
        """Test /api/auth/me without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ /api/auth/me correctly requires authentication")


class TestCheckoutAPI:
    """Test checkout with BBQ products including grade/aging customizations"""
    
    def test_checkout_session_creation(self):
        """Test creating checkout session with customized steak"""
        # Get a steak product first
        products_response = requests.get(f"{BASE_URL}/api/bbq-products")
        assert products_response.status_code == 200
        
        products = products_response.json()
        steak = next((p for p in products if 'steak' in p.get('name', '').lower()), None)
        
        if not steak:
            pytest.skip("No steak products available")
        
        # Create checkout with customized steak (Prime grade, 35d aged)
        # Price calculation: basePrice + grade_modifier (8 for Prime) * quantity + flat aging fee (10)
        base_price = float(steak.get('basePrice', 0))
        grade_modifier = 8  # Prime
        dry_aging_fee = 10  # 35 days flat fee
        quantity = 2
        
        # Price per lb with grade = base + modifier
        price_per_lb = base_price + grade_modifier
        # Total = (price_per_lb * quantity) + flat aging fee
        expected_price = (price_per_lb * quantity) + dry_aging_fee
        
        cart_items = [{
            "product_id": steak['id'],
            "product_name": f"{steak['name']} (Prime, 35d Aged)",
            "price": price_per_lb + (dry_aging_fee / quantity),  # Price per item
            "quantity": quantity,
            "weight": "1 lb",
            "subscribe": False
        }]
        
        response = requests.post(
            f"{BASE_URL}/api/checkout/session",
            json={
                "cart_items": cart_items,
                "origin_url": "https://wagyu-vault.preview.emergentagent.com"
            }
        )
        
        assert response.status_code == 200, f"Checkout failed: {response.text}"
        
        data = response.json()
        assert "url" in data, "Response should contain checkout URL"
        assert "session_id" in data, "Response should contain session_id"
        
        print(f"✅ Checkout session created with customized steak: {steak['name']} (Prime, 35d Aged)")
        print(f"   Session ID: {data['session_id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
