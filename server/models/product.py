from extensions import db
from datetime import datetime


class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    slug = db.Column(db.String(200), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    short_description = db.Column(db.String(500))
    price = db.Column(db.Numeric(10, 2), nullable=False)
    compare_at_price = db.Column(db.Numeric(10, 2))  # Original price for discounts
    cost = db.Column(db.Numeric(10, 2))  # Cost price (for profit calculation)
    sku = db.Column(db.String(100), unique=True, index=True)
    barcode = db.Column(db.String(100))
    
    # Inventory
    stock_quantity = db.Column(db.Integer, default=0)
    low_stock_threshold = db.Column(db.Integer, default=10)
    track_inventory = db.Column(db.Boolean, default=True)
    
    # Organization
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    brand = db.Column(db.String(100))
    tags = db.Column(db.String(500))  # Comma-separated tags
    
    # Media
    image_url = db.Column(db.String(500))
    images = db.Column(db.JSON)  # Array of additional image URLs
    
    # SEO
    meta_title = db.Column(db.String(200))
    meta_description = db.Column(db.String(500))
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    
    # Stats
    view_count = db.Column(db.Integer, default=0)
    sales_count = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = db.relationship('Category', back_populates='products')
    order_items = db.relationship('OrderItem', back_populates='product')
    
    @property
    def is_in_stock(self):
        """Check if product is in stock."""
        if not self.track_inventory:
            return True
        return self.stock_quantity > 0
    
    @property
    def is_low_stock(self):
        """Check if product is low on stock."""
        if not self.track_inventory:
            return False
        return 0 < self.stock_quantity <= self.low_stock_threshold
    
    def to_dict(self, include_category=True):
        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'short_description': self.short_description,
            'price': float(self.price) if self.price else 0,
            'compare_at_price': float(self.compare_at_price) if self.compare_at_price else None,
            'cost': float(self.cost) if self.cost else None,
            'sku': self.sku,
            'barcode': self.barcode,
            'stock_quantity': self.stock_quantity,
            'low_stock_threshold': self.low_stock_threshold,
            'track_inventory': self.track_inventory,
            'category_id': self.category_id,
            'brand': self.brand,
            'tags': self.tags.split(',') if self.tags else [],
            'image_url': self.image_url,
            'images': self.images or [],
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'is_in_stock': self.is_in_stock,
            'is_low_stock': self.is_low_stock,
            'view_count': self.view_count,
            'sales_count': self.sales_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_category and self.category:
            data['category'] = self.category.to_dict(include_products=False)
        
        return data
    
    def __repr__(self):
        return f'<Product {self.name}>'
