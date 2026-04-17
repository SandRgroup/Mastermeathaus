"""
Test Image Upload Authentication Flow
Tests the /api/upload/image endpoint with proper authentication
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://wagyu-vault.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@mastermeatbox.com"
ADMIN_PASSWORD = "MMB@dmin2025!Secure"

# Small valid PNG image (1x1 pixel green)
TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="


class TestImageUploadAuthentication:
    """Test image upload endpoint authentication"""
    
    @pytest.fixture
    def session(self):
        """Create a requests session"""
        return requests.Session()
    
    @pytest.fixture
    def authenticated_session(self, session):
        """Login and return authenticated session with cookies"""
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        # Cookies are automatically stored in session
        return session
    
    def test_upload_without_auth_returns_401(self, session):
        """Test that upload without authentication returns 401"""
        # Create test image file
        image_data = base64.b64decode(TEST_IMAGE_BASE64)
        files = {'file': ('test.png', image_data, 'image/png')}
        
        response = session.post(
            f"{BASE_URL}/api/upload/image",
            files=files
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        assert "Not authenticated" in response.text or "authenticated" in response.text.lower()
        print("✓ Upload without auth correctly returns 401")
    
    def test_upload_with_auth_succeeds(self, authenticated_session):
        """Test that upload with authentication succeeds"""
        # Create test image file
        image_data = base64.b64decode(TEST_IMAGE_BASE64)
        files = {'file': ('test.png', image_data, 'image/png')}
        
        response = authenticated_session.post(
            f"{BASE_URL}/api/upload/image",
            files=files
        )
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        
        # Verify response structure
        data = response.json()
        assert "url" in data, "Response should contain 'url' field"
        assert data["url"].startswith("http"), "URL should be a valid HTTP URL"
        assert ".png" in data["url"] or "uploads" in data["url"], "URL should reference uploaded file"
        
        print(f"✓ Upload with auth succeeded, URL: {data['url']}")
    
    def test_upload_with_bearer_token_succeeds(self, session):
        """Test that upload with Bearer token in header succeeds"""
        # First login to get cookies
        login_response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert login_response.status_code == 200
        
        # Extract access_token from cookies
        access_token = session.cookies.get('access_token')
        assert access_token, "access_token cookie should be set after login"
        
        # Create new session without cookies but with Bearer token
        new_session = requests.Session()
        new_session.headers.update({"Authorization": f"Bearer {access_token}"})
        
        # Create test image file
        image_data = base64.b64decode(TEST_IMAGE_BASE64)
        files = {'file': ('test.png', image_data, 'image/png')}
        
        response = new_session.post(
            f"{BASE_URL}/api/upload/image",
            files=files
        )
        
        assert response.status_code == 200, f"Upload with Bearer token failed: {response.text}"
        data = response.json()
        assert "url" in data
        
        print(f"✓ Upload with Bearer token succeeded, URL: {data['url']}")
    
    def test_upload_non_image_returns_400(self, authenticated_session):
        """Test that uploading non-image file returns 400"""
        # Create a text file
        files = {'file': ('test.txt', b'This is not an image', 'text/plain')}
        
        response = authenticated_session.post(
            f"{BASE_URL}/api/upload/image",
            files=files
        )
        
        assert response.status_code == 400, f"Expected 400 for non-image, got {response.status_code}"
        assert "image" in response.text.lower()
        
        print("✓ Non-image upload correctly returns 400")


class TestProductUpdateWithImage:
    """Test product update flow with image upload"""
    
    @pytest.fixture
    def authenticated_session(self):
        """Login and return authenticated session"""
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return session
    
    def test_get_products(self, authenticated_session):
        """Test getting products list"""
        response = authenticated_session.get(f"{BASE_URL}/api/products")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            product = data[0]
            assert "id" in product or "_id" in product
            assert "name" in product
            print(f"✓ Got {len(data)} products")
        else:
            print("✓ Products endpoint works (empty list)")
    
    def test_update_product_with_image_url(self, authenticated_session):
        """Test updating product with uploaded image URL"""
        # First get products
        products_response = authenticated_session.get(f"{BASE_URL}/api/products")
        assert products_response.status_code == 200
        products = products_response.json()
        
        if len(products) == 0:
            pytest.skip("No products to update")
        
        product = products[0]
        product_id = product.get("id") or product.get("_id")
        
        # Upload an image first
        image_data = base64.b64decode(TEST_IMAGE_BASE64)
        files = {'file': ('test.png', image_data, 'image/png')}
        
        upload_response = authenticated_session.post(
            f"{BASE_URL}/api/upload/image",
            files=files
        )
        assert upload_response.status_code == 200
        image_url = upload_response.json()["url"]
        
        # Update product with new image
        update_data = {
            "name": product.get("name", "Test Product"),
            "grade": product.get("grade", "CERTIFIED ANGUS BEEF"),
            "description": product.get("description", "Test description"),
            "price": product.get("price", "49.99"),
            "image": image_url
        }
        
        update_response = authenticated_session.put(
            f"{BASE_URL}/api/products/{product_id}",
            json=update_data
        )
        
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify the update
        updated_product = update_response.json()
        assert updated_product.get("image") == image_url, "Image URL should be updated"
        
        print(f"✓ Product {product_id} updated with new image URL")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
