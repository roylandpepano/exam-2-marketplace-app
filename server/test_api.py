"""
API Testing Examples
Run these tests after starting the server to verify endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_login():
    """Test admin login"""
    print("\n=== Testing Login ===")
    
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": "admin@example.com",
            "password": "admin123"
        }
    )
    
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    
    if response.status_code == 200:
        return data.get('access_token')
    return None


def test_get_products(token):
    """Test getting products"""
    print("\n=== Testing Get Products ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/api/admin/products",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total Products: {data.get('total', 0)}")


def test_get_categories(token):
    """Test getting categories"""
    print("\n=== Testing Get Categories ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/api/admin/categories",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total Categories: {data.get('total', 0)}")


def test_get_orders(token):
    """Test getting orders"""
    print("\n=== Testing Get Orders ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/api/admin/orders",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total Orders: {data.get('total', 0)}")


def test_get_users(token):
    """Test getting users"""
    print("\n=== Testing Get Users ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/api/admin/users",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total Users: {data.get('total', 0)}")


def test_dashboard_analytics(token):
    """Test dashboard analytics"""
    print("\n=== Testing Dashboard Analytics ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/api/admin/analytics/dashboard",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total Users: {data.get('users', {}).get('total', 0)}")
    print(f"Total Products: {data.get('products', {}).get('total', 0)}")
    print(f"Total Orders: {data.get('orders', {}).get('total', 0)}")


def test_create_category(token):
    """Test creating a category"""
    print("\n=== Testing Create Category ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": "Test Category",
        "description": "This is a test category",
        "is_active": "true"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/admin/categories",
        headers=headers,
        data=data
    )
    
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")


if __name__ == "__main__":
    print("=" * 50)
    print("API Testing Suite")
    print("=" * 50)
    print("\nMake sure the server is running at http://localhost:5000")
    print("Press Ctrl+C to exit")
    
    try:
        # Login and get token
        token = test_login()
        
        if token:
            print("\n✓ Login successful!")
            
            # Run tests
            test_get_products(token)
            test_get_categories(token)
            test_get_orders(token)
            test_get_users(token)
            test_dashboard_analytics(token)
            test_create_category(token)
            
            print("\n" + "=" * 50)
            print("✓ All tests completed!")
            print("=" * 50)
        else:
            print("\n✗ Login failed! Check your credentials and server.")
    
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to server.")
        print("Make sure the server is running at http://localhost:5000")
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
