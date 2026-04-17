"""
Test suite for Products Manager with Image Upload functionality
Tests: Products CRUD, Image Upload, Image URL handling
"""
import pytest
import requests
import os
import base64
from io import BytesIO

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://wagyu-vault.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@mastermeatbox.com"
ADMIN_PASSWORD = "MMB@dmin2025!Secure"


class TestProductsImageUpload:
    """Test Products Manager with Image Upload functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get auth cookies
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.user = login_response.json()
        print(f"Logged in as: {self.user['email']}")
        
        yield
        
        # Cleanup: Delete test products
        products = self.session.get(f"{BASE_URL}/api/products").json()
        for product in products:
            if product.get('name', '').startswith('TEST_'):
                product_id = product.get('id') or product.get('_id')
                self.session.delete(f"{BASE_URL}/api/products/{product_id}")
                print(f"Cleaned up test product: {product['name']}")
    
    def test_get_products(self):
        """Test GET /api/products returns list of products"""
        response = self.session.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        assert isinstance(products, list)
        print(f"Found {len(products)} products")
        
        # Check product structure
        if len(products) > 0:
            product = products[0]
            assert 'id' in product or '_id' in product
            assert 'name' in product
            assert 'image' in product
            print(f"First product: {product['name']}, image: {product['image'][:50]}...")
    
    def test_create_product_with_image_url(self):
        """Test creating a product with an image URL"""
        test_image_url = "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400"
        
        product_data = {
            "name": "TEST_Product_With_URL",
            "grade": "Prime",
            "description": "Test product with image URL",
            "price": "$99.99",
            "image": test_image_url,
            "weight_unit": "oz"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        assert response.status_code == 200 or response.status_code == 201, f"Create failed: {response.text}"
        
        created_product = response.json()
        assert created_product['name'] == product_data['name']
        assert created_product['image'] == test_image_url
        print(f"Created product with image URL: {created_product['name']}")
        
        # Verify product exists in database
        product_id = created_product.get('id') or created_product.get('_id')
        get_response = self.session.get(f"{BASE_URL}/api/products")
        products = get_response.json()
        found = any(p.get('id') == product_id or p.get('_id') == product_id for p in products)
        assert found, "Created product not found in database"
    
    def test_image_upload_endpoint(self):
        """Test POST /api/upload/image endpoint"""
        # Create a minimal valid PNG image
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        # Use a fresh session for file upload (cookies are shared)
        upload_session = requests.Session()
        upload_session.cookies = self.session.cookies
        
        files = {'file': ('test_image.png', BytesIO(png_data), 'image/png')}
        
        response = upload_session.post(
            f"{BASE_URL}/api/upload/image",
            files=files
        )
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        result = response.json()
        assert 'url' in result
        assert result['url'].endswith('.png')
        print(f"Uploaded image URL: {result['url']}")
    
    def test_image_upload_rejects_non_image(self):
        """Test that upload endpoint rejects non-image files"""
        # Use a fresh session for file upload (cookies are shared)
        upload_session = requests.Session()
        upload_session.cookies = self.session.cookies
        
        files = {'file': ('test.txt', BytesIO(b'not an image'), 'text/plain')}
        
        response = upload_session.post(
            f"{BASE_URL}/api/upload/image",
            files=files
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        print("Non-image file correctly rejected")
    
    def test_update_product_image(self):
        """Test updating a product's image"""
        # First create a product
        product_data = {
            "name": "TEST_Product_For_Update",
            "grade": "Prime",
            "description": "Test product for image update",
            "price": "$49.99",
            "image": "https://via.placeholder.com/400x300",
            "weight_unit": "oz"
        }
        
        create_response = self.session.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        assert create_response.status_code in [200, 201]
        created_product = create_response.json()
        product_id = created_product.get('id') or created_product.get('_id')
        
        # Update the image
        new_image_url = "https://images.unsplash.com/photo-1558030006-450675393462?w=400"
        update_data = {"image": new_image_url}
        
        update_response = self.session.put(
            f"{BASE_URL}/api/products/{product_id}",
            json=update_data
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        updated_product = update_response.json()
        assert updated_product['image'] == new_image_url
        print(f"Updated product image to: {new_image_url[:50]}...")
    
    def test_create_product_with_uploaded_image(self):
        """Test creating a product using an uploaded image"""
        # First upload an image using a fresh session
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        upload_session = requests.Session()
        upload_session.cookies = self.session.cookies
        
        files = {'file': ('product_image.png', BytesIO(png_data), 'image/png')}
        
        upload_response = upload_session.post(
            f"{BASE_URL}/api/upload/image",
            files=files
        )
        assert upload_response.status_code == 200, f"Upload failed: {upload_response.text}"
        uploaded_url = upload_response.json()['url']
        
        # Create product with uploaded image URL
        product_data = {
            "name": "TEST_Product_With_Upload",
            "grade": "A5 Wagyu",
            "description": "Test product with uploaded image",
            "price": "$199.99",
            "image": uploaded_url,
            "weight_unit": "oz"
        }
        
        create_response = self.session.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        assert create_response.status_code in [200, 201]
        
        created_product = create_response.json()
        assert created_product['image'] == uploaded_url
        print(f"Created product with uploaded image: {created_product['name']}")
    
    def test_delete_product(self):
        """Test deleting a product"""
        # First create a product
        product_data = {
            "name": "TEST_Product_To_Delete",
            "grade": "Prime",
            "description": "Test product for deletion",
            "price": "$29.99",
            "image": "https://via.placeholder.com/400x300",
            "weight_unit": "oz"
        }
        
        create_response = self.session.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        assert create_response.status_code in [200, 201]
        created_product = create_response.json()
        product_id = created_product.get('id') or created_product.get('_id')
        
        # Delete the product
        delete_response = self.session.delete(f"{BASE_URL}/api/products/{product_id}")
        assert delete_response.status_code == 200
        
        # Verify product is deleted
        products = self.session.get(f"{BASE_URL}/api/products").json()
        found = any(p.get('id') == product_id or p.get('_id') == product_id for p in products)
        assert not found, "Product should be deleted"
        print(f"Successfully deleted product: {product_id}")


class TestProductsManagerUI:
    """Test that Products Manager is accessible from admin dashboard"""
    
    def test_products_endpoint_accessible(self):
        """Test that products API is accessible"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        print("Products API is accessible")
    
    def test_upload_requires_auth(self):
        """Test that upload endpoint requires authentication"""
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        
        files = {'file': ('test.png', BytesIO(png_data), 'image/png')}
        response = requests.post(f"{BASE_URL}/api/upload/image", files=files)
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Upload endpoint correctly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
