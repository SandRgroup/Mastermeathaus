"""
Test suite for AI BBQ Planner feature
Tests: POST /api/bbq-plans, GET /api/bbq-plans, GET /api/bbq-plans/{plan_id}
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBBQPlannerAPI:
    """BBQ Planner API endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_plan_id = None
        self.test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
    def test_get_bbq_plans_returns_200(self):
        """GET /api/bbq-plans should return 200"""
        response = requests.get(f"{BASE_URL}/api/bbq-plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ GET /api/bbq-plans returns 200")
        
    def test_get_bbq_plans_returns_list(self):
        """GET /api/bbq-plans should return a list"""
        response = requests.get(f"{BASE_URL}/api/bbq-plans")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/bbq-plans returns list with {len(data)} items")
        
    def test_create_bbq_plan_success(self):
        """POST /api/bbq-plans should create a new plan"""
        payload = {
            "prompt": "TEST_15 people luxury ribeye dinner",
            "people": 15,
            "event_type": "Luxury experience",
            "portion_per_person": 1.3,
            "selected_categories": ["steak", "chicken"],
            "selected_cuts": {
                "steak": ["ribeye", "tomahawk"],
                "chicken": ["whole", "wings"]
            },
            "beef_quality": "wagyu",
            "addons": "Rubs and marinades",
            "total_lbs": 19.5,
            "total_price": 975.50,
            "lead": {
                "first_name": "TestUser",
                "email": self.test_email,
                "zip_code": "75201"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/bbq-plans", json=payload)
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain 'id'"
        assert data["prompt"] == payload["prompt"], "Prompt should match"
        assert data["people"] == payload["people"], "People count should match"
        assert data["event_type"] == payload["event_type"], "Event type should match"
        assert data["beef_quality"] == payload["beef_quality"], "Beef quality should match"
        assert data["lead"]["first_name"] == payload["lead"]["first_name"], "Lead first_name should match"
        assert data["lead"]["email"] == payload["lead"]["email"], "Lead email should match"
        assert "created_at" in data, "Response should contain 'created_at'"
        
        self.test_plan_id = data["id"]
        print(f"✓ POST /api/bbq-plans creates plan with id: {self.test_plan_id}")
        return data["id"]
        
    def test_create_bbq_plan_validates_email(self):
        """POST /api/bbq-plans should validate email format"""
        payload = {
            "prompt": "TEST_10 people BBQ",
            "people": 10,
            "event_type": "Casual",
            "portion_per_person": 1.2,
            "selected_categories": ["steak"],
            "selected_cuts": {"steak": ["ribeye"]},
            "beef_quality": "standard",
            "addons": "",
            "total_lbs": 12.0,
            "total_price": 288.0,
            "lead": {
                "first_name": "Test",
                "email": "invalid-email",  # Invalid email
                "zip_code": "12345"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/bbq-plans", json=payload)
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        print("✓ POST /api/bbq-plans validates email format (422 for invalid)")
        
    def test_create_bbq_plan_requires_all_fields(self):
        """POST /api/bbq-plans should require all mandatory fields"""
        # Missing 'lead' field
        payload = {
            "prompt": "TEST_10 people BBQ",
            "people": 10,
            "event_type": "Casual",
            "portion_per_person": 1.2,
            "selected_categories": ["steak"],
            "selected_cuts": {"steak": ["ribeye"]},
            "beef_quality": "standard",
            "total_lbs": 12.0,
            "total_price": 288.0
            # Missing 'lead'
        }
        
        response = requests.post(f"{BASE_URL}/api/bbq-plans", json=payload)
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
        print("✓ POST /api/bbq-plans requires all mandatory fields (422 for missing)")
        
    def test_get_bbq_plan_by_id(self):
        """GET /api/bbq-plans/{plan_id} should return specific plan"""
        # First create a plan
        payload = {
            "prompt": "TEST_8 people family dinner",
            "people": 8,
            "event_type": "Family experience",
            "portion_per_person": 1.1,
            "selected_categories": ["lamb"],
            "selected_cuts": {"lamb": ["chops", "rack"]},
            "beef_quality": "standard",
            "addons": "",
            "total_lbs": 8.8,
            "total_price": 383.68,
            "lead": {
                "first_name": "FamilyTest",
                "email": f"family_{uuid.uuid4().hex[:8]}@test.com",
                "zip_code": "90210"
            }
        }
        
        create_response = requests.post(f"{BASE_URL}/api/bbq-plans", json=payload)
        assert create_response.status_code == 201
        plan_id = create_response.json()["id"]
        
        # Now get by ID
        get_response = requests.get(f"{BASE_URL}/api/bbq-plans/{plan_id}")
        assert get_response.status_code == 200, f"Expected 200, got {get_response.status_code}"
        
        data = get_response.json()
        assert data["id"] == plan_id, "Plan ID should match"
        assert data["prompt"] == payload["prompt"], "Prompt should match"
        assert data["people"] == payload["people"], "People count should match"
        print(f"✓ GET /api/bbq-plans/{plan_id} returns correct plan")
        
    def test_get_bbq_plan_not_found(self):
        """GET /api/bbq-plans/{plan_id} should return 404 for non-existent plan"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/bbq-plans/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ GET /api/bbq-plans/{fake_id} returns 404 for non-existent plan")
        
    def test_bbq_plan_response_structure(self):
        """Verify BBQ plan response has all required fields"""
        response = requests.get(f"{BASE_URL}/api/bbq-plans")
        assert response.status_code == 200
        
        plans = response.json()
        if len(plans) > 0:
            plan = plans[0]
            required_fields = [
                "id", "prompt", "people", "event_type", "portion_per_person",
                "selected_categories", "selected_cuts", "beef_quality", "addons",
                "total_lbs", "total_price", "lead", "created_at"
            ]
            for field in required_fields:
                assert field in plan, f"Plan should have '{field}' field"
            
            # Check lead structure
            lead_fields = ["first_name", "email", "zip_code"]
            for field in lead_fields:
                assert field in plan["lead"], f"Lead should have '{field}' field"
            
            print("✓ BBQ plan response has all required fields")
        else:
            print("⚠ No plans to verify structure (skipping)")
            
    def test_bbq_plan_data_types(self):
        """Verify BBQ plan data types are correct"""
        payload = {
            "prompt": "TEST_20 people party",
            "people": 20,
            "event_type": "Party experience",
            "portion_per_person": 1.0,
            "selected_categories": ["sausage", "pork"],
            "selected_cuts": {
                "sausage": ["bratwurst", "italian"],
                "pork": ["ribs", "shoulder"]
            },
            "beef_quality": "standard",
            "addons": "Charcoal",
            "total_lbs": 20.0,
            "total_price": 530.0,
            "lead": {
                "first_name": "PartyHost",
                "email": f"party_{uuid.uuid4().hex[:8]}@test.com",
                "zip_code": "10001"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/bbq-plans", json=payload)
        assert response.status_code == 201
        
        data = response.json()
        assert isinstance(data["id"], str), "id should be string"
        assert isinstance(data["prompt"], str), "prompt should be string"
        assert isinstance(data["people"], int), "people should be int"
        assert isinstance(data["event_type"], str), "event_type should be string"
        assert isinstance(data["portion_per_person"], float), "portion_per_person should be float"
        assert isinstance(data["selected_categories"], list), "selected_categories should be list"
        assert isinstance(data["selected_cuts"], dict), "selected_cuts should be dict"
        assert isinstance(data["beef_quality"], str), "beef_quality should be string"
        assert isinstance(data["total_lbs"], float), "total_lbs should be float"
        assert isinstance(data["total_price"], float), "total_price should be float"
        assert isinstance(data["lead"], dict), "lead should be dict"
        assert isinstance(data["created_at"], str), "created_at should be string"
        
        print("✓ BBQ plan data types are correct")
        
    def test_bbq_plan_with_all_categories(self):
        """Test creating plan with all 5 protein categories"""
        payload = {
            "prompt": "TEST_30 people mixed BBQ feast",
            "people": 30,
            "event_type": "Party experience",
            "portion_per_person": 1.2,
            "selected_categories": ["steak", "chicken", "lamb", "pork", "sausage"],
            "selected_cuts": {
                "steak": ["ribeye", "strip"],
                "chicken": ["whole", "wings"],
                "lamb": ["chops"],
                "pork": ["ribs", "belly"],
                "sausage": ["bratwurst", "chorizo"]
            },
            "beef_quality": "grass_fed",
            "addons": "Full BBQ setup",
            "total_lbs": 36.0,
            "total_price": 1080.0,
            "lead": {
                "first_name": "BigEvent",
                "email": f"bigevent_{uuid.uuid4().hex[:8]}@test.com",
                "zip_code": "60601"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/bbq-plans", json=payload)
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert len(data["selected_categories"]) == 5, "Should have 5 categories"
        assert len(data["selected_cuts"]) == 5, "Should have cuts for 5 categories"
        
        print("✓ BBQ plan with all 5 categories created successfully")
        
    def test_bbq_plan_beef_quality_options(self):
        """Test all beef quality options: standard, grass_fed, wagyu"""
        quality_options = ["standard", "grass_fed", "wagyu"]
        
        for quality in quality_options:
            payload = {
                "prompt": f"TEST_5 people {quality} dinner",
                "people": 5,
                "event_type": "Casual",
                "portion_per_person": 1.2,
                "selected_categories": ["steak"],
                "selected_cuts": {"steak": ["ribeye"]},
                "beef_quality": quality,
                "addons": "",
                "total_lbs": 6.0,
                "total_price": 144.0,
                "lead": {
                    "first_name": f"Quality{quality}",
                    "email": f"quality_{quality}_{uuid.uuid4().hex[:8]}@test.com",
                    "zip_code": "33101"
                }
            }
            
            response = requests.post(f"{BASE_URL}/api/bbq-plans", json=payload)
            assert response.status_code == 201, f"Failed for quality '{quality}': {response.text}"
            assert response.json()["beef_quality"] == quality
            
        print("✓ All beef quality options (standard, grass_fed, wagyu) work correctly")


class TestBBQPlannerDataPersistence:
    """Test data persistence in MongoDB"""
    
    def test_plan_persists_after_creation(self):
        """Verify plan is retrievable after creation"""
        unique_prompt = f"TEST_PERSIST_{uuid.uuid4().hex[:8]}"
        payload = {
            "prompt": unique_prompt,
            "people": 12,
            "event_type": "Family experience",
            "portion_per_person": 1.1,
            "selected_categories": ["chicken"],
            "selected_cuts": {"chicken": ["breast"]},
            "beef_quality": "standard",
            "addons": "",
            "total_lbs": 13.2,
            "total_price": 132.0,
            "lead": {
                "first_name": "PersistTest",
                "email": f"persist_{uuid.uuid4().hex[:8]}@test.com",
                "zip_code": "94102"
            }
        }
        
        # Create
        create_response = requests.post(f"{BASE_URL}/api/bbq-plans", json=payload)
        assert create_response.status_code == 201
        plan_id = create_response.json()["id"]
        
        # Retrieve by ID
        get_response = requests.get(f"{BASE_URL}/api/bbq-plans/{plan_id}")
        assert get_response.status_code == 200
        assert get_response.json()["prompt"] == unique_prompt
        
        # Verify in list
        list_response = requests.get(f"{BASE_URL}/api/bbq-plans")
        assert list_response.status_code == 200
        plans = list_response.json()
        plan_ids = [p["id"] for p in plans]
        assert plan_id in plan_ids, "Created plan should be in list"
        
        print("✓ Plan persists correctly in MongoDB")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
