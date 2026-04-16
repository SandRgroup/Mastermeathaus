"""
Unified Products Manager API Tests
Tests for the unified CMS/CRM system where products sync to both collections
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://wagyu-vault.preview.emergentagent.com')

class TestUnifiedProductsSync:
    """Test unified product creation syncs to both bbq_products and products collections"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get session cookies"""
        self.session = requests.Session()
        response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@mastermeatbox.com",
                "password": "MMB@dmin2025!Secure"
            }
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.admin_data = response.json()
        print(f"✓ Logged in as {self.admin_data['email']}")
        yield
        # Cleanup: Delete any test products
        self._cleanup_test_products()
    
    def _cleanup_test_products(self):
        """Remove any TEST_ prefixed products"""
        try:
            bbq_products = self.session.get(f"{BASE_URL}/api/bbq-products").json()
            for product in bbq_products:
                if product.get('name', '').startswith('TEST_'):
                    self.session.delete(f"{BASE_URL}/api/bbq-products/{product['id']}")
                    print(f"  Cleaned up: {product['name']}")
        except Exception as e:
            print(f"  Cleanup warning: {e}")
    
    def test_admin_login(self):
        """Test admin login with correct credentials"""
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
        assert data.get('email') == 'admin@mastermeatbox.com'
        print("✓ Admin login successful")
    
    def test_create_product_syncs_to_both_collections(self):
        """Test creating a product via bbq-products syncs to products collection"""
        # Create product
        product_data = {
            "name": "TEST_Sync_Product",
            "description": "Test product for sync verification",
            "basePrice": 55.55,
            "wagyuUpcharge": 10.0,
            "grassFedUpcharge": 5.0,
            "dryAgedUpcharge": 8.0,
            "ranchOrigin": "Test Ranch, USA",
            "genetics": "Test genetics",
            "grainFinished": "300+ Days",
            "gradeLabel": "TEST Grade",
            "meatType": "beef",
            "category": "test",
            "defaultGrade": "prime"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/bbq-products",
            json=product_data
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        created = response.json()
        product_id = created.get('id') or created.get('_id')
        assert product_id, "No product ID returned"
        print(f"✓ Created product with ID: {product_id}")
        
        # Verify in bbq_products
        bbq_response = requests.get(f"{BASE_URL}/api/bbq-products")
        bbq_products = bbq_response.json()
        bbq_match = next((p for p in bbq_products if p.get('name') == 'TEST_Sync_Product'), None)
        assert bbq_match is not None, "Product not found in bbq_products"
        assert bbq_match['basePrice'] == 55.55
        print("✓ Product found in bbq_products collection")
        
        # Verify in products collection
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product_match = next((p for p in products if p.get('name') == 'TEST_Sync_Product'), None)
        assert product_match is not None, "Product not found in products collection"
        assert product_match['price'] == "$55.55"
        assert product_match['grade'] == "TEST Grade"
        print("✓ Product found in products collection with correct price format")
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/bbq-products/{product_id}")
    
    def test_update_product_syncs_to_both_collections(self):
        """Test updating a product syncs changes to both collections"""
        # Create product first
        create_response = self.session.post(
            f"{BASE_URL}/api/bbq-products",
            json={
                "name": "TEST_Update_Product",
                "description": "Original description",
                "basePrice": 30.00,
                "wagyuUpcharge": 5.0,
                "grassFedUpcharge": 3.0,
                "dryAgedUpcharge": 4.0,
                "ranchOrigin": "Original Ranch",
                "genetics": "Original genetics",
                "grainFinished": "200+ Days",
                "gradeLabel": "Original Grade",
                "meatType": "beef",
                "category": "test",
                "defaultGrade": "prime"
            }
        )
        created = create_response.json()
        product_id = created.get('id') or created.get('_id')
        print(f"✓ Created product for update test: {product_id}")
        
        # Update product
        update_response = self.session.put(
            f"{BASE_URL}/api/bbq-products/{product_id}",
            json={
                "name": "TEST_Update_Product_MODIFIED",
                "description": "Updated description",
                "basePrice": 45.00,
                "wagyuUpcharge": 10.0,
                "grassFedUpcharge": 6.0,
                "dryAgedUpcharge": 8.0,
                "ranchOrigin": "Updated Ranch",
                "genetics": "Updated genetics",
                "grainFinished": "350+ Days",
                "gradeLabel": "Updated Grade",
                "meatType": "beef",
                "category": "test",
                "defaultGrade": "wagyu"
            }
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        print("✓ Product updated successfully")
        
        # Verify update in bbq_products
        bbq_response = requests.get(f"{BASE_URL}/api/bbq-products")
        bbq_products = bbq_response.json()
        bbq_match = next((p for p in bbq_products if p.get('id') == product_id), None)
        assert bbq_match is not None, "Updated product not found in bbq_products"
        assert bbq_match['name'] == "TEST_Update_Product_MODIFIED"
        assert bbq_match['basePrice'] == 45.00
        print("✓ Update verified in bbq_products collection")
        
        # Verify update in products collection
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product_match = next((p for p in products if p.get('name') == 'TEST_Update_Product_MODIFIED'), None)
        assert product_match is not None, "Updated product not found in products collection"
        assert product_match['price'] == "$45.00"
        assert product_match['grade'] == "Updated Grade"
        print("✓ Update verified in products collection")
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/bbq-products/{product_id}")
    
    def test_delete_product_removes_from_both_collections(self):
        """Test deleting a product removes it from both collections"""
        # Create product first
        create_response = self.session.post(
            f"{BASE_URL}/api/bbq-products",
            json={
                "name": "TEST_Delete_Product",
                "description": "Product to be deleted",
                "basePrice": 25.00,
                "wagyuUpcharge": 5.0,
                "grassFedUpcharge": 3.0,
                "dryAgedUpcharge": 4.0,
                "ranchOrigin": "Delete Ranch",
                "genetics": "Delete genetics",
                "grainFinished": "200+ Days",
                "gradeLabel": "Delete Grade",
                "meatType": "beef",
                "category": "test",
                "defaultGrade": "prime"
            }
        )
        created = create_response.json()
        product_id = created.get('id') or created.get('_id')
        print(f"✓ Created product for delete test: {product_id}")
        
        # Verify exists in both collections before delete
        bbq_before = requests.get(f"{BASE_URL}/api/bbq-products").json()
        products_before = requests.get(f"{BASE_URL}/api/products").json()
        assert any(p.get('id') == product_id for p in bbq_before), "Product not in bbq_products before delete"
        assert any(p.get('name') == 'TEST_Delete_Product' for p in products_before), "Product not in products before delete"
        print("✓ Product exists in both collections before delete")
        
        # Delete product
        delete_response = self.session.delete(f"{BASE_URL}/api/bbq-products/{product_id}")
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        print("✓ Delete request successful")
        
        # Verify removed from bbq_products
        bbq_after = requests.get(f"{BASE_URL}/api/bbq-products").json()
        assert not any(p.get('id') == product_id for p in bbq_after), "Product still in bbq_products after delete"
        print("✓ Product removed from bbq_products collection")
        
        # Verify removed from products collection
        products_after = requests.get(f"{BASE_URL}/api/products").json()
        assert not any(p.get('name') == 'TEST_Delete_Product' for p in products_after), "Product still in products after delete"
        print("✓ Product removed from products collection")
    
    def test_product_count_consistency(self):
        """Test that product counts are consistent across collections"""
        bbq_products = requests.get(f"{BASE_URL}/api/bbq-products").json()
        products = requests.get(f"{BASE_URL}/api/products").json()
        
        # Count BBQ products that should be in products collection
        bbq_count = len(bbq_products)
        
        # Products collection may have additional non-BBQ products
        # But all BBQ products should be in products
        bbq_names = {p['name'] for p in bbq_products}
        products_names = {p['name'] for p in products}
        
        missing_in_products = bbq_names - products_names
        assert len(missing_in_products) == 0, f"BBQ products missing from products collection: {missing_in_products}"
        
        print(f"✓ BBQ Products count: {bbq_count}")
        print(f"✓ Products collection count: {len(products)}")
        print("✓ All BBQ products exist in products collection")


class TestBBQProductsEndpoint:
    """Test BBQ Products endpoint functionality"""
    
    def test_get_all_bbq_products(self):
        """Test GET /api/bbq-products returns products"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 16, f"Expected at least 16 products, got {len(data)}"
        print(f"✓ Found {len(data)} BBQ products")
    
    def test_bbq_products_have_required_fields(self):
        """Test each product has required fields"""
        response = requests.get(f"{BASE_URL}/api/bbq-products")
        data = response.json()
        
        required_fields = ['id', 'name', 'description', 'basePrice', 'meatType', 
                          'wagyuUpcharge', 'grassFedUpcharge', 'dryAgedUpcharge']
        
        for product in data:
            for field in required_fields:
                assert field in product, f"Product {product.get('name', 'unknown')} missing field: {field}"
        
        print("✓ All products have required fields")
    
    def test_products_endpoint_returns_synced_data(self):
        """Test /api/products returns BBQ products with correct format"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        
        # Check that products have the expected format
        for product in data:
            assert 'name' in product
            assert 'price' in product
            assert 'grade' in product
            # Price should be formatted as string with $
            if product['price']:
                assert product['price'].startswith('$'), f"Price not formatted: {product['price']}"
        
        print(f"✓ Products endpoint returns {len(data)} products with correct format")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
