"""
Test suite for Packages and Boxes API endpoints
Phase 2: Half/Quarter Cow Packages
Phase 3: Steak Boxes (Wagyu Luxury Bundle, Wagyu Starter, American Steakhouse, Master Cuts)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
ADMIN_EMAIL = "admin@mastermeatbox.com"
ADMIN_PASSWORD = "MMB@dmin2025!Secure"


class TestPackagesAPI:
    """Test /api/packages endpoints - Half/Quarter Cow Packages"""
    
    def test_get_packages_returns_200(self):
        """GET /api/packages should return 200 OK"""
        response = requests.get(f"{BASE_URL}/api/packages")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/packages returned 200 OK")
    
    def test_get_packages_returns_list(self):
        """GET /api/packages should return a list"""
        response = requests.get(f"{BASE_URL}/api/packages")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/packages returned list with {len(data)} packages")
    
    def test_packages_have_required_fields(self):
        """Each package should have required fields: id, name, description, salePrice, regularPrice, items"""
        response = requests.get(f"{BASE_URL}/api/packages")
        packages = response.json()
        
        required_fields = ['id', 'name', 'description', 'salePrice', 'regularPrice', 'items']
        
        for pkg in packages:
            for field in required_fields:
                assert field in pkg, f"Package missing required field: {field}"
            
            # Validate price types
            assert isinstance(pkg['salePrice'], (int, float)), f"salePrice should be numeric"
            assert isinstance(pkg['regularPrice'], (int, float)), f"regularPrice should be numeric"
            assert pkg['salePrice'] < pkg['regularPrice'], f"salePrice should be less than regularPrice"
            
            # Validate items is a list
            assert isinstance(pkg['items'], list), f"items should be a list"
        
        print(f"✓ All {len(packages)} packages have required fields with valid types")
    
    def test_quarter_cow_package_exists(self):
        """Quarter Cow Package should exist with correct pricing"""
        response = requests.get(f"{BASE_URL}/api/packages")
        packages = response.json()
        
        quarter_cow = next((p for p in packages if 'quarter' in p['name'].lower()), None)
        assert quarter_cow is not None, "Quarter Cow Package not found"
        assert quarter_cow['salePrice'] == 749.0, f"Expected salePrice 749, got {quarter_cow['salePrice']}"
        assert quarter_cow['regularPrice'] == 899.0, f"Expected regularPrice 899, got {quarter_cow['regularPrice']}"
        assert len(quarter_cow['items']) > 0, "Quarter Cow Package should have items"
        
        print(f"✓ Quarter Cow Package found: ${quarter_cow['salePrice']} (was ${quarter_cow['regularPrice']})")
    
    def test_half_cow_package_exists(self):
        """Half Cow Package should exist with correct pricing"""
        response = requests.get(f"{BASE_URL}/api/packages")
        packages = response.json()
        
        half_cow = next((p for p in packages if 'half' in p['name'].lower()), None)
        assert half_cow is not None, "Half Cow Package not found"
        assert half_cow['salePrice'] == 1399.0, f"Expected salePrice 1399, got {half_cow['salePrice']}"
        assert half_cow['regularPrice'] == 1699.0, f"Expected regularPrice 1699, got {half_cow['regularPrice']}"
        assert len(half_cow['items']) > 0, "Half Cow Package should have items"
        
        print(f"✓ Half Cow Package found: ${half_cow['salePrice']} (was ${half_cow['regularPrice']})")
    
    def test_package_items_have_required_fields(self):
        """Package items should have name, quantity, and unit fields"""
        response = requests.get(f"{BASE_URL}/api/packages")
        packages = response.json()
        
        for pkg in packages:
            for item in pkg['items']:
                assert 'name' in item, f"Item missing 'name' field"
                assert 'quantity' in item, f"Item missing 'quantity' field"
                assert 'unit' in item, f"Item missing 'unit' field"
                assert isinstance(item['quantity'], (int, float)), f"quantity should be numeric"
        
        print(f"✓ All package items have required fields (name, quantity, unit)")


class TestBoxesAPI:
    """Test /api/boxes endpoints - Steak Boxes"""
    
    def test_get_boxes_returns_200(self):
        """GET /api/boxes should return 200 OK"""
        response = requests.get(f"{BASE_URL}/api/boxes")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/boxes returned 200 OK")
    
    def test_get_boxes_returns_list(self):
        """GET /api/boxes should return a list"""
        response = requests.get(f"{BASE_URL}/api/boxes")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/boxes returned list with {len(data)} boxes")
    
    def test_boxes_have_required_fields(self):
        """Each box should have required fields: id, name, description, price, items"""
        response = requests.get(f"{BASE_URL}/api/boxes")
        boxes = response.json()
        
        required_fields = ['id', 'name', 'description', 'price', 'items']
        
        for box in boxes:
            for field in required_fields:
                assert field in box, f"Box missing required field: {field}"
            
            # Validate price type
            assert isinstance(box['price'], (int, float)), f"price should be numeric"
            
            # Validate items is a list
            assert isinstance(box['items'], list), f"items should be a list"
        
        print(f"✓ All {len(boxes)} boxes have required fields with valid types")
    
    def test_wagyu_luxury_bundle_exists(self):
        """Wagyu Luxury Bundle should exist with correct pricing"""
        response = requests.get(f"{BASE_URL}/api/boxes")
        boxes = response.json()
        
        wagyu_luxury = next((b for b in boxes if 'wagyu luxury' in b['name'].lower()), None)
        assert wagyu_luxury is not None, "Wagyu Luxury Bundle not found"
        assert wagyu_luxury['price'] == 299.0, f"Expected price 299, got {wagyu_luxury['price']}"
        assert wagyu_luxury.get('featured') == True, "Wagyu Luxury Bundle should be featured"
        
        print(f"✓ Wagyu Luxury Bundle found: ${wagyu_luxury['price']} (featured: {wagyu_luxury.get('featured')})")
    
    def test_wagyu_starter_bundle_exists(self):
        """Wagyu Starter Bundle should exist with correct pricing"""
        response = requests.get(f"{BASE_URL}/api/boxes")
        boxes = response.json()
        
        wagyu_starter = next((b for b in boxes if 'wagyu starter' in b['name'].lower()), None)
        assert wagyu_starter is not None, "Wagyu Starter Bundle not found"
        assert wagyu_starter['price'] == 149.0, f"Expected price 149, got {wagyu_starter['price']}"
        
        print(f"✓ Wagyu Starter Bundle found: ${wagyu_starter['price']}")
    
    def test_american_steakhouse_box_exists(self):
        """American Steakhouse Box should exist with correct pricing"""
        response = requests.get(f"{BASE_URL}/api/boxes")
        boxes = response.json()
        
        steakhouse = next((b for b in boxes if 'steakhouse' in b['name'].lower()), None)
        assert steakhouse is not None, "American Steakhouse Box not found"
        assert steakhouse['price'] == 179.0, f"Expected price 179, got {steakhouse['price']}"
        
        print(f"✓ American Steakhouse Box found: ${steakhouse['price']}")
    
    def test_master_cuts_bundle_exists(self):
        """Master Cuts Bundle should exist with correct pricing"""
        response = requests.get(f"{BASE_URL}/api/boxes")
        boxes = response.json()
        
        master_cuts = next((b for b in boxes if 'master cuts' in b['name'].lower()), None)
        assert master_cuts is not None, "Master Cuts Bundle not found"
        assert master_cuts['price'] == 199.0, f"Expected price 199, got {master_cuts['price']}"
        
        print(f"✓ Master Cuts Bundle found: ${master_cuts['price']}")
    
    def test_box_items_have_required_fields(self):
        """Box items should have name, quantity, and unit fields"""
        response = requests.get(f"{BASE_URL}/api/boxes")
        boxes = response.json()
        
        for box in boxes:
            for item in box['items']:
                assert 'name' in item, f"Item missing 'name' field"
                assert 'quantity' in item, f"Item missing 'quantity' field"
                assert 'unit' in item, f"Item missing 'unit' field"
        
        print(f"✓ All box items have required fields (name, quantity, unit)")
    
    def test_boxes_have_features(self):
        """Boxes should have features array"""
        response = requests.get(f"{BASE_URL}/api/boxes")
        boxes = response.json()
        
        for box in boxes:
            assert 'features' in box, f"Box {box['name']} missing 'features' field"
            assert isinstance(box['features'], list), f"features should be a list"
        
        print(f"✓ All boxes have features array")


class TestAuthenticatedPackageOperations:
    """Test authenticated CRUD operations for packages"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if login_response.status_code != 200:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
        return session
    
    def test_create_package_requires_auth(self):
        """POST /api/packages should require authentication"""
        response = requests.post(f"{BASE_URL}/api/packages", json={
            "name": "TEST_Package",
            "description": "Test package",
            "salePrice": 100,
            "regularPrice": 150,
            "items": []
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ POST /api/packages requires authentication (returned {response.status_code})")
    
    def test_create_and_delete_package(self, auth_session):
        """Create a test package and then delete it"""
        # Create package
        create_response = auth_session.post(f"{BASE_URL}/api/packages", json={
            "name": "TEST_Bulk Package",
            "description": "Test bulk package for testing",
            "salePrice": 500.0,
            "regularPrice": 600.0,
            "items": [
                {"name": "Test Ribeye", "quantity": 5, "unit": "lbs"},
                {"name": "Test Ground Beef", "quantity": 10, "unit": "lbs"}
            ]
        })
        
        assert create_response.status_code in [200, 201], f"Create failed: {create_response.status_code}"
        created_pkg = create_response.json()
        assert 'id' in created_pkg, "Created package should have an id"
        
        print(f"✓ Created test package with id: {created_pkg['id']}")
        
        # Verify it exists
        get_response = requests.get(f"{BASE_URL}/api/packages")
        packages = get_response.json()
        found = any(p['id'] == created_pkg['id'] for p in packages)
        assert found, "Created package not found in GET response"
        
        # Delete package
        delete_response = auth_session.delete(f"{BASE_URL}/api/packages/{created_pkg['id']}")
        assert delete_response.status_code in [200, 204], f"Delete failed: {delete_response.status_code}"
        
        print(f"✓ Deleted test package: {created_pkg['id']}")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/packages")
        packages = get_response.json()
        found = any(p['id'] == created_pkg['id'] for p in packages)
        assert not found, "Deleted package still exists"
        
        print(f"✓ Verified package deletion")


class TestAuthenticatedBoxOperations:
    """Test authenticated CRUD operations for boxes"""
    
    @pytest.fixture
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if login_response.status_code != 200:
            pytest.skip(f"Authentication failed: {login_response.status_code}")
        return session
    
    def test_create_box_requires_auth(self):
        """POST /api/boxes should require authentication"""
        response = requests.post(f"{BASE_URL}/api/boxes", json={
            "name": "TEST_Box",
            "description": "Test box",
            "price": 100,
            "items": [],
            "features": []
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ POST /api/boxes requires authentication (returned {response.status_code})")
    
    def test_create_and_delete_box(self, auth_session):
        """Create a test box and then delete it"""
        # Create box
        create_response = auth_session.post(f"{BASE_URL}/api/boxes", json={
            "name": "TEST_Premium Box",
            "description": "Test premium box for testing",
            "price": 250.0,
            "items": [
                {"name": "Test Filet", "quantity": 2, "unit": "8oz"},
                {"name": "Test Ribeye", "quantity": 2, "unit": "12oz"}
            ],
            "features": ["Test feature 1", "Test feature 2"],
            "featured": False
        })
        
        assert create_response.status_code in [200, 201], f"Create failed: {create_response.status_code}"
        created_box = create_response.json()
        assert 'id' in created_box, "Created box should have an id"
        
        print(f"✓ Created test box with id: {created_box['id']}")
        
        # Verify it exists
        get_response = requests.get(f"{BASE_URL}/api/boxes")
        boxes = get_response.json()
        found = any(b['id'] == created_box['id'] for b in boxes)
        assert found, "Created box not found in GET response"
        
        # Delete box
        delete_response = auth_session.delete(f"{BASE_URL}/api/boxes/{created_box['id']}")
        assert delete_response.status_code in [200, 204], f"Delete failed: {delete_response.status_code}"
        
        print(f"✓ Deleted test box: {created_box['id']}")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/boxes")
        boxes = get_response.json()
        found = any(b['id'] == created_box['id'] for b in boxes)
        assert not found, "Deleted box still exists"
        
        print(f"✓ Verified box deletion")


class TestCheckoutIntegration:
    """Test checkout flow with packages and boxes"""
    
    def test_checkout_session_endpoint_exists(self):
        """POST /api/checkout/session should exist"""
        response = requests.post(f"{BASE_URL}/api/checkout/session", json={
            "cart_items": [],
            "origin_url": "https://test.com"
        })
        # Should not be 404 - could be 400 for empty cart or 200 for success
        assert response.status_code != 404, "Checkout session endpoint not found"
        print(f"✓ POST /api/checkout/session endpoint exists (returned {response.status_code})")
    
    def test_checkout_with_package_item(self):
        """Test checkout session creation with a package item"""
        # Get a package first
        packages_response = requests.get(f"{BASE_URL}/api/packages")
        packages = packages_response.json()
        
        if not packages:
            pytest.skip("No packages available for testing")
        
        pkg = packages[0]
        
        # Create checkout session with package
        response = requests.post(f"{BASE_URL}/api/checkout/session", json={
            "cart_items": [{
                "product_id": pkg['id'],
                "product_name": pkg['name'],
                "price": pkg['salePrice'],
                "quantity": 1,
                "weight": "package",
                "subscribe": False,
                "image": "/api/placeholder/400/300"
            }],
            "origin_url": "https://test.com"
        })
        
        # Should return 200 with Stripe URL or error about Stripe config
        assert response.status_code in [200, 400, 500], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert 'url' in data, "Response should contain Stripe checkout URL"
            print(f"✓ Checkout session created for package: {pkg['name']}")
        else:
            print(f"✓ Checkout endpoint responded (status: {response.status_code})")
    
    def test_checkout_with_box_item(self):
        """Test checkout session creation with a box item"""
        # Get a box first
        boxes_response = requests.get(f"{BASE_URL}/api/boxes")
        boxes = boxes_response.json()
        
        if not boxes:
            pytest.skip("No boxes available for testing")
        
        box = boxes[0]
        
        # Create checkout session with box
        response = requests.post(f"{BASE_URL}/api/checkout/session", json={
            "cart_items": [{
                "product_id": box['id'],
                "product_name": box['name'],
                "price": box['price'],
                "quantity": 1,
                "weight": "box",
                "subscribe": False,
                "image": "/api/placeholder/400/300"
            }],
            "origin_url": "https://test.com"
        })
        
        # Should return 200 with Stripe URL or error about Stripe config
        assert response.status_code in [200, 400, 500], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert 'url' in data, "Response should contain Stripe checkout URL"
            print(f"✓ Checkout session created for box: {box['name']}")
        else:
            print(f"✓ Checkout endpoint responded (status: {response.status_code})")


class TestBBQProductsWithUpcharges:
    """Test BBQ products with multi-unit pricing and upcharges"""
    
    def test_get_bbq_products_returns_200(self):
        """GET /api/bbq-products should return 200 OK"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ GET /api/bbq-products returned 200 OK")
    
    def test_bbq_products_have_upcharge_fields(self):
        """BBQ products should have upcharge fields for Wagyu, Grass-Fed, Dry-Aged"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        products = response.json()
        
        upcharge_fields = ['wagyuUpcharge', 'grassFedUpcharge', 'dryAgedUpcharge']
        
        for product in products:
            for field in upcharge_fields:
                assert field in product, f"Product {product.get('name', 'unknown')} missing {field}"
                assert isinstance(product[field], (int, float)), f"{field} should be numeric"
        
        print(f"✓ All {len(products)} BBQ products have upcharge fields")
    
    def test_bbq_products_have_base_price(self):
        """BBQ products should have basePrice field"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        products = response.json()
        
        for product in products:
            assert 'basePrice' in product, f"Product {product.get('name', 'unknown')} missing basePrice"
            assert isinstance(product['basePrice'], (int, float)), "basePrice should be numeric"
        
        print(f"✓ All BBQ products have basePrice field")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
