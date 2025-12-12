from extensions import db
from datetime import datetime
from enum import Enum


class OrderStatus(str, Enum):
    PENDING = 'Pending'
    CONFIRMED = 'Confirmed'
    PROCESSING = 'Processing'
    SHIPPED = 'Shipped'
    DELIVERED = 'Delivered'
    CANCELLED = 'Cancelled'
    REFUNDED = 'Refunded'


class PaymentStatus(str, Enum):
    PENDING = 'Pending'
    PAID = 'Paid'
    FAILED = 'Failed'
    REFUNDED = 'Refunded'


class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Status
    status = db.Column(db.String(20), default=OrderStatus.PENDING.value)
    payment_status = db.Column(db.String(20), default=PaymentStatus.PENDING.value)
    
    # Amounts
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    tax = db.Column(db.Numeric(10, 2), default=0)
    shipping_cost = db.Column(db.Numeric(10, 2), default=0)
    discount = db.Column(db.Numeric(10, 2), default=0)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Shipping
    shipping_name = db.Column(db.String(200))
    shipping_street = db.Column(db.String(200))
    shipping_city = db.Column(db.String(100))
    shipping_state = db.Column(db.String(100))
    shipping_postal_code = db.Column(db.String(20))
    shipping_country = db.Column(db.String(100))
    shipping_phone = db.Column(db.String(20))
    
    # Tracking
    tracking_number = db.Column(db.String(100))
    carrier = db.Column(db.String(100))
    estimated_delivery = db.Column(db.DateTime)
    
    # Notes
    customer_notes = db.Column(db.Text)
    admin_notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    confirmed_at = db.Column(db.DateTime)
    shipped_at = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    
    # Relationships
    user = db.relationship('User', back_populates='orders')
    items = db.relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')
    
    def to_dict(self, include_items=True, include_user=False):
        data = {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'status': self.status,
            'payment_status': self.payment_status,
            'subtotal': float(self.subtotal) if self.subtotal else 0,
            'tax': float(self.tax) if self.tax else 0,
            'shipping_cost': float(self.shipping_cost) if self.shipping_cost else 0,
            'discount': float(self.discount) if self.discount else 0,
            'total': float(self.total) if self.total else 0,
            'shipping_address': {
                'name': self.shipping_name,
                'street': self.shipping_street,
                'city': self.shipping_city,
                'state': self.shipping_state,
                'postal_code': self.shipping_postal_code,
                'country': self.shipping_country,
                'phone': self.shipping_phone
            },
            'tracking_number': self.tracking_number,
            'carrier': self.carrier,
            'estimated_delivery': self.estimated_delivery.isoformat() if self.estimated_delivery else None,
            'customer_notes': self.customer_notes,
            'admin_notes': self.admin_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'shipped_at': self.shipped_at.isoformat() if self.shipped_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None
        }
        
        if include_items:
            data['items'] = [item.to_dict() for item in self.items]
        
        if include_user and self.user:
            data['user'] = self.user.to_dict()
        
        return data
    
    def __repr__(self):
        return f'<Order {self.order_number}>'


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # Snapshot of product data at time of purchase
    product_name = db.Column(db.String(200), nullable=False)
    product_sku = db.Column(db.String(100))
    product_image = db.Column(db.String(500))
    
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    order = db.relationship('Order', back_populates='items')
    product = db.relationship('Product', back_populates='order_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_sku': self.product_sku,
            'product_image': self.product_image,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price) if self.unit_price else 0,
            'total_price': float(self.total_price) if self.total_price else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<OrderItem {self.product_name} x{self.quantity}>'
