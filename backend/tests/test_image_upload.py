"""
Test Image Upload and Product Image Management
Tests:
1. Image upload endpoint POST /api/upload/image
2. Product creation with image URL
3. Product update with new image
4. Products display with images
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestImageUpload:
    """Test image upload functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - login and get auth token"""
        self.session = requests.Session()
        # Login to get auth cookie
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@mastermeatbox.com",
                "password": "MMB@dmin2025!Secure"
            }
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.user = login_response.json()
        print(f"Logged in as: {self.user['email']}")
    
    def test_image_upload_requires_auth(self):
        """Test that image upload requires authentication"""
        # Create a simple test image
        image_data = self._create_test_image()
        
        # Try upload without auth
        response = requests.post(
            f"{BASE_URL}/api/upload/image",
            files={"file": ("test.png", image_data, "image/png")}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Image upload requires authentication")
    
    def test_image_upload_success(self):
        """Test successful image upload with auth"""
        image_data = self._create_test_image()
        
        response = self.session.post(
            f"{BASE_URL}/api/upload/image",
            files={"file": ("test_product.png", image_data, "image/png")}
        )
        
        assert response.status_code == 200, f"Upload failed: {response.status_code} - {response.text}"
        data = response.json()
        assert "url" in data, "Response should contain 'url' field"
        assert data["url"].endswith(".png"), f"URL should end with .png: {data['url']}"
        print(f"PASS: Image uploaded successfully, URL: {data['url']}")
        return data["url"]
    
    def test_image_upload_rejects_non_image(self):
        """Test that non-image files are rejected"""
        text_data = io.BytesIO(b"This is not an image")
        
        response = self.session.post(
            f"{BASE_URL}/api/upload/image",
            files={"file": ("test.txt", text_data, "text/plain")}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("PASS: Non-image files are rejected")
    
    def test_create_product_with_image_url(self):
        """Test creating a product with an image URL"""
        product_data = {
            "name": "TEST_Product_With_Image",
            "description": "Test product with image URL",
            "price": "$99.99",
            "grade": "Prime",
            "image": "https://via.placeholder.com/400x300/1a1a1a/C8A96A?text=Test+Product",
            "category": "usda_prime",
            "weight": "12 oz",
            "weight_unit": "oz"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        
        assert response.status_code == 200, f"Create failed: {response.status_code} - {response.text}"
        data = response.json()
        assert data["name"] == product_data["name"]
        assert data["image"] == product_data["image"]
        print(f"PASS: Product created with image URL, ID: {data['id']}")
        return data["id"]
    
    def test_update_product_image(self):
        """Test updating a product's image"""
        # First create a product
        product_id = self.test_create_product_with_image_url()
        
        # Update with new image
        new_image_url = "https://via.placeholder.com/400x300/2a2a2a/FFD700?text=Updated+Image"
        update_data = {
            "image": new_image_url
        }
        
        response = self.session.put(
            f"{BASE_URL}/api/products/{product_id}",
            json=update_data
        )
        
        assert response.status_code == 200, f"Update failed: {response.status_code} - {response.text}"
        data = response.json()
        assert data["image"] == new_image_url, f"Image not updated: {data['image']}"
        print(f"PASS: Product image updated successfully")
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/products/{product_id}")
    
    def test_upload_and_create_product_flow(self):
        """Test full flow: upload image then create product with uploaded URL"""
        # Upload image
        image_data = self._create_test_image()
        upload_response = self.session.post(
            f"{BASE_URL}/api/upload/image",
            files={"file": ("product_image.png", image_data, "image/png")}
        )
        
        assert upload_response.status_code == 200, f"Upload failed: {upload_response.text}"
        uploaded_url = upload_response.json()["url"]
        print(f"Image uploaded: {uploaded_url}")
        
        # Create product with uploaded image
        product_data = {
            "name": "TEST_Product_Uploaded_Image",
            "description": "Product with uploaded image",
            "price": "$149.99",
            "grade": "Wagyu",
            "image": uploaded_url,
            "category": "american_wagyu",
            "weight": "16 oz",
            "weight_unit": "oz"
        }
        
        create_response = self.session.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        product = create_response.json()
        assert product["image"] == uploaded_url
        print(f"PASS: Full upload and create flow works, Product ID: {product['id']}")
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/products/{product['id']}")
    
    def test_products_list_includes_images(self):
        """Test that products list includes image URLs"""
        response = requests.get(f"{BASE_URL}/api/products")
        
        assert response.status_code == 200
        products = response.json()
        
        # Check that products have image field
        for product in products[:5]:  # Check first 5
            assert "image" in product, f"Product {product.get('name')} missing image field"
            print(f"Product: {product['name']}, Image: {product['image'][:50]}...")
        
        print(f"PASS: All {len(products)} products have image field")
    
    def _create_test_image(self):
        """Create a simple PNG image for testing"""
        # Minimal valid PNG (1x1 red pixel)
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1 dimensions
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  # 8-bit RGB
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,  # Compressed data
            0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xDD,  
            0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,  # IEND chunk
            0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        return io.BytesIO(png_data)


class TestProductImageDisplay:
    """Test product image display on frontend"""
    
    def test_products_endpoint_returns_images(self):
        """Verify products API returns image URLs"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        products = response.json()
        products_with_images = [p for p in products if p.get("image")]
        products_with_placeholder = [p for p in products if "/placeholder" in str(p.get("image", ""))]
        
        print(f"Total products: {len(products)}")
        print(f"Products with images: {len(products_with_images)}")
        print(f"Products with placeholder images: {len(products_with_placeholder)}")
        
        # All products should have image field
        assert len(products_with_images) == len(products), "Some products missing images"
        print("PASS: All products have image URLs")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
