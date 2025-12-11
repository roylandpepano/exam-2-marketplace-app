"""
Database initialization and seeding script
"""
from app import create_app
from extensions import db
from models import User, Category, Product, Order
import os

def init_db():
    """Initialize database and create tables."""
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("✓ Database tables created successfully")
        
        # Check if admin user exists
        admin_email = app.config['ADMIN_EMAIL']
        admin = User.query.filter_by(email=admin_email).first()
        
        if not admin:
            print(f"\nCreating admin user: {admin_email}")
            admin = User(
                email=admin_email,
                username='admin',
                first_name='Admin',
                last_name='User',
                is_admin=True
            )
            admin.set_password(app.config['ADMIN_PASSWORD'])
            db.session.add(admin)
            db.session.commit()
            print(f"✓ Admin user created: {admin_email}")
            print(f"  Password: {app.config['ADMIN_PASSWORD']}")
            print("\n⚠️  IMPORTANT: Change the admin password in production!")
        else:
            print(f"\n✓ Admin user already exists: {admin_email}")
        
        print("\n✓ Database initialization complete!")
        print(f"\nYou can now:")
        print(f"  1. Start the server: python app.py")
        print(f"  2. Login with: {admin_email}")
        print(f"  3. Access API at: http://localhost:5000")


def seed_sample_data():
    """Seed database with sample data for testing."""
    app = create_app()
    
    with app.app_context():
        print("Seeding sample data...")
        
        # Create sample categories
        categories_data = [
            {'name': 'Electronics', 'description': 'Electronic devices and accessories'},
            {'name': 'Clothing', 'description': 'Fashion and apparel'},
            {'name': 'Books', 'description': 'Books and publications'},
            {'name': 'Home & Garden', 'description': 'Home improvement and garden supplies'},
            {'name': 'Sports', 'description': 'Sports equipment and gear'}
        ]
        
        categories = []
        for i, cat_data in enumerate(categories_data):
            existing = Category.query.filter_by(name=cat_data['name']).first()
            if not existing:
                from utils.helpers import generate_slug
                cat = Category(
                    name=cat_data['name'],
                    slug=generate_slug(cat_data['name']),
                    description=cat_data['description'],
                    display_order=i
                )
                db.session.add(cat)
                categories.append(cat)
        
        db.session.commit()
        print(f"✓ Created {len(categories)} categories")
        
        # Create sample products
        sample_products = [
            {
                'name': 'Wireless Headphones',
                'description': 'High-quality wireless headphones with noise cancellation',
                'price': 99.99,
                'stock_quantity': 50,
                'category_name': 'Electronics'
            },
            {
                'name': 'Running Shoes',
                'description': 'Comfortable running shoes for all terrains',
                'price': 79.99,
                'stock_quantity': 100,
                'category_name': 'Sports'
            },
            {
                'name': 'Python Programming Book',
                'description': 'Learn Python programming from scratch',
                'price': 39.99,
                'stock_quantity': 30,
                'category_name': 'Books'
            }
        ]
        
        products = []
        for prod_data in sample_products:
            existing = Product.query.filter_by(name=prod_data['name']).first()
            if not existing:
                from utils.helpers import generate_slug
                category = Category.query.filter_by(name=prod_data['category_name']).first()
                
                prod = Product(
                    name=prod_data['name'],
                    slug=generate_slug(prod_data['name']),
                    description=prod_data['description'],
                    price=prod_data['price'],
                    stock_quantity=prod_data['stock_quantity'],
                    category_id=category.id if category else None,
                    sku=f"SKU-{generate_slug(prod_data['name']).upper()}"
                )
                db.session.add(prod)
                products.append(prod)
        
        db.session.commit()
        print(f"✓ Created {len(products)} sample products")
        
        print("\n✓ Sample data seeding complete!")


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--seed':
        seed_sample_data()
    else:
        init_db()
