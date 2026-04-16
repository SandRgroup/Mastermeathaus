"""
BBQ Products API Tests
Tests for the Premium BBQ Builder feature with 16 products
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://wagyu-vault.preview.emergentagent.com')

class TestBBQProductsAPI:
    """Test BBQ Products endpoint"""
    
    def test_get_all_bbq_products(self):
        """Test GET /api/bbq-products returns all 16 products"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 16, f"Expected 16 products, got {len(data)}"
        print(f"✓ Found {len(data)} BBQ products")
    
    def test_bbq_products_have_required_fields(self):
        """Test each product has required fields"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        data = response.json()
        
        required_fields = ['id', 'name', 'description', 'basePrice', 'meatType']
        
        for product in data:
            for field in required_fields:
                assert field in product, f"Product {product.get('name', 'unknown')} missing field: {field}"
        
        print("✓ All products have required fields")
    
    def test_new_products_exist(self):
        """Test the 5 new products are present"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        data = response.json()
        
        new_products = {
            'Italian Sausages': 18.0,
            'Bratwurst Sausages': 16.0,
            'Lamb Chops': 42.0,
            'Chicken Drumsticks': 12.0,
            'Chicken Wings': 14.0
        }
        
        product_names = {p['name']: p['basePrice'] for p in data}
        
        for name, expected_price in new_products.items():
            assert name in product_names, f"Missing new product: {name}"
            assert product_names[name] == expected_price, f"{name} price mismatch: expected ${expected_price}, got ${product_names[name]}"
            print(f"✓ {name}: ${expected_price}")
    
    def test_meat_type_distribution(self):
        """Test products are categorized by meat type"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        data = response.json()
        
        meat_types = {}
        for product in data:
            meat_type = product.get('meatType', 'unknown')
            meat_types[meat_type] = meat_types.get(meat_type, 0) + 1
        
        # Expected distribution
        assert meat_types.get('beef', 0) == 10, f"Expected 10 beef products, got {meat_types.get('beef', 0)}"
        assert meat_types.get('lamb', 0) == 1, f"Expected 1 lamb product, got {meat_types.get('lamb', 0)}"
        assert meat_types.get('pork', 0) == 3, f"Expected 3 pork products, got {meat_types.get('pork', 0)}"
        assert meat_types.get('chicken', 0) == 2, f"Expected 2 chicken products, got {meat_types.get('chicken', 0)}"
        
        print(f"✓ Meat type distribution: {meat_types}")
    
    def test_upcharge_structure(self):
        """Test upcharge fields are present and correct for new products"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        data = response.json()
        
        # Sausages should have no Wagyu upcharge
        sausages = [p for p in data if 'Sausage' in p['name']]
        for sausage in sausages:
            assert sausage.get('wagyuUpcharge', 0) == 0, f"{sausage['name']} should have no Wagyu upcharge"
            print(f"✓ {sausage['name']}: No Wagyu upcharge (correct)")
        
        # Chicken should have no dry-aged option
        chicken = [p for p in data if p.get('meatType') == 'chicken']
        for c in chicken:
            assert c.get('dryAgedUpcharge', 0) == 0, f"{c['name']} should have no dry-aged upcharge"
            print(f"✓ {c['name']}: No dry-aged upcharge (correct)")
        
        # Lamb Chops should have higher grass-fed upcharge
        lamb = next((p for p in data if p['name'] == 'Lamb Chops'), None)
        assert lamb is not None, "Lamb Chops not found"
        assert lamb.get('grassFedUpcharge', 0) == 12, f"Lamb Chops grass-fed upcharge should be $12, got ${lamb.get('grassFedUpcharge', 0)}"
        print(f"✓ Lamb Chops: Grass-fed upcharge $12 (correct)")
    
    def test_product_descriptions_exist(self):
        """Test all products have descriptions"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        data = response.json()
        
        for product in data:
            assert product.get('description'), f"Product {product['name']} missing description"
            assert len(product['description']) > 10, f"Product {product['name']} description too short"
        
        print("✓ All products have descriptions")


class TestAuthAndCMS:
    """Test Admin authentication and CMS access"""
    
    def test_admin_login(self):
        """Test admin login works"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@mastersmeathaus.com",
                "password": "MMH@dmin2025!Secure"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get('role') == 'admin'
        print("✓ Admin login successful")
    
    def test_alternative_admin_login(self):
        """Test alternative admin credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@mastermeatbox.com",
                "password": "MMB@dmin2025!Secure"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get('role') == 'admin'
        print("✓ Alternative admin login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
