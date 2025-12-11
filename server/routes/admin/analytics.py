from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.user import User
from models.product import Product
from models.category import Category
from models.order import Order, OrderItem, OrderStatus, PaymentStatus
from extensions import db
from utils.auth import admin_required
from sqlalchemy import func, desc
from datetime import datetime, timedelta

admin_analytics_bp = Blueprint('admin_analytics', __name__)


@admin_analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_stats():
    """Get comprehensive dashboard statistics."""
    # Date range
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # User stats
    total_users = User.query.count()
    new_users = User.query.filter(User.created_at >= start_date).count()
    active_users = User.query.filter_by(is_active=True).count()
    
    # Product stats
    total_products = Product.query.count()
    active_products = Product.query.filter_by(is_active=True).count()
    low_stock_products = Product.query.filter(
        Product.track_inventory == True,
        Product.stock_quantity > 0,
        Product.stock_quantity <= Product.low_stock_threshold
    ).count()
    out_of_stock_products = Product.query.filter(
        Product.track_inventory == True,
        Product.stock_quantity <= 0
    ).count()
    
    # Category stats
    total_categories = Category.query.count()
    active_categories = Category.query.filter_by(is_active=True).count()
    
    # Order stats
    total_orders = Order.query.count()
    recent_orders = Order.query.filter(Order.created_at >= start_date).count()
    pending_orders = Order.query.filter_by(status=OrderStatus.PENDING.value).count()
    processing_orders = Order.query.filter_by(status=OrderStatus.PROCESSING.value).count()
    shipped_orders = Order.query.filter_by(status=OrderStatus.SHIPPED.value).count()
    
    # Revenue stats (only paid orders)
    revenue_query = db.session.query(
        func.sum(Order.total).label('total_revenue'),
        func.sum(Order.subtotal).label('subtotal'),
        func.sum(Order.tax).label('tax'),
        func.sum(Order.shipping_cost).label('shipping'),
        func.count(Order.id).label('order_count')
    ).filter(Order.payment_status == PaymentStatus.PAID.value)
    
    all_time_revenue = revenue_query.first()
    recent_revenue = revenue_query.filter(Order.created_at >= start_date).first()
    
    # Top selling products
    top_products = db.session.query(
        Product.id,
        Product.name,
        Product.image_url,
        func.sum(OrderItem.quantity).label('total_sold'),
        func.sum(OrderItem.total_price).label('total_revenue')
    ).join(OrderItem).join(Order).filter(
        Order.payment_status == PaymentStatus.PAID.value
    ).group_by(Product.id, Product.name, Product.image_url).order_by(
        desc('total_sold')
    ).limit(5).all()
    
    # Recent orders
    recent_orders_list = Order.query.order_by(
        Order.created_at.desc()
    ).limit(10).all()
    
    return jsonify({
        'users': {
            'total': total_users,
            'new': new_users,
            'active': active_users,
            'inactive': total_users - active_users
        },
        'products': {
            'total': total_products,
            'active': active_products,
            'inactive': total_products - active_products,
            'low_stock': low_stock_products,
            'out_of_stock': out_of_stock_products
        },
        'categories': {
            'total': total_categories,
            'active': active_categories,
            'inactive': total_categories - active_categories
        },
        'orders': {
            'total': total_orders,
            'recent': recent_orders,
            'pending': pending_orders,
            'processing': processing_orders,
            'shipped': shipped_orders
        },
        'revenue': {
            'all_time': {
                'total': float(all_time_revenue.total_revenue or 0),
                'subtotal': float(all_time_revenue.subtotal or 0),
                'tax': float(all_time_revenue.tax or 0),
                'shipping': float(all_time_revenue.shipping or 0),
                'order_count': all_time_revenue.order_count
            },
            'recent': {
                'total': float(recent_revenue.total_revenue or 0),
                'subtotal': float(recent_revenue.subtotal or 0),
                'tax': float(recent_revenue.tax or 0),
                'shipping': float(recent_revenue.shipping or 0),
                'order_count': recent_revenue.order_count,
                'days': days
            }
        },
        'top_products': [
            {
                'id': p.id,
                'name': p.name,
                'image_url': p.image_url,
                'total_sold': int(p.total_sold),
                'total_revenue': float(p.total_revenue)
            }
            for p in top_products
        ],
        'recent_orders': [
            order.to_dict(include_items=False, include_user=True)
            for order in recent_orders_list
        ]
    }), 200


@admin_analytics_bp.route('/sales', methods=['GET'])
@jwt_required()
@admin_required
def get_sales_analytics():
    """Get sales analytics over time."""
    # Date range
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Daily sales
    daily_sales = db.session.query(
        func.date(Order.created_at).label('date'),
        func.count(Order.id).label('order_count'),
        func.sum(Order.total).label('revenue')
    ).filter(
        Order.created_at >= start_date,
        Order.payment_status == PaymentStatus.PAID.value
    ).group_by(
        func.date(Order.created_at)
    ).order_by('date').all()
    
    return jsonify({
        'daily_sales': [
            {
                'date': str(day.date),
                'order_count': day.order_count,
                'revenue': float(day.revenue or 0)
            }
            for day in daily_sales
        ]
    }), 200


@admin_analytics_bp.route('/products/performance', methods=['GET'])
@jwt_required()
@admin_required
def get_product_performance():
    """Get product performance metrics."""
    limit = request.args.get('limit', 10, type=int)
    
    # Top selling products
    top_sellers = db.session.query(
        Product.id,
        Product.name,
        Product.sku,
        Product.image_url,
        func.sum(OrderItem.quantity).label('total_sold'),
        func.sum(OrderItem.total_price).label('revenue')
    ).join(OrderItem).join(Order).filter(
        Order.payment_status == PaymentStatus.PAID.value
    ).group_by(
        Product.id, Product.name, Product.sku, Product.image_url
    ).order_by(desc('total_sold')).limit(limit).all()
    
    # Low stock products
    low_stock = Product.query.filter(
        Product.track_inventory == True,
        Product.stock_quantity > 0,
        Product.stock_quantity <= Product.low_stock_threshold
    ).order_by(Product.stock_quantity.asc()).limit(limit).all()
    
    # Out of stock products
    out_of_stock = Product.query.filter(
        Product.track_inventory == True,
        Product.stock_quantity <= 0
    ).order_by(Product.stock_quantity.asc()).limit(limit).all()
    
    return jsonify({
        'top_sellers': [
            {
                'id': p.id,
                'name': p.name,
                'sku': p.sku,
                'image_url': p.image_url,
                'total_sold': int(p.total_sold),
                'revenue': float(p.revenue)
            }
            for p in top_sellers
        ],
        'low_stock': [p.to_dict(include_category=False) for p in low_stock],
        'out_of_stock': [p.to_dict(include_category=False) for p in out_of_stock]
    }), 200


@admin_analytics_bp.route('/categories/performance', methods=['GET'])
@jwt_required()
@admin_required
def get_category_performance():
    """Get category performance metrics."""
    # Revenue by category
    category_revenue = db.session.query(
        Category.id,
        Category.name,
        func.count(OrderItem.id).label('items_sold'),
        func.sum(OrderItem.total_price).label('revenue')
    ).join(Product).join(OrderItem).join(Order).filter(
        Order.payment_status == PaymentStatus.PAID.value
    ).group_by(
        Category.id, Category.name
    ).order_by(desc('revenue')).all()
    
    return jsonify({
        'category_performance': [
            {
                'id': c.id,
                'name': c.name,
                'items_sold': c.items_sold,
                'revenue': float(c.revenue or 0)
            }
            for c in category_revenue
        ]
    }), 200


@admin_analytics_bp.route('/users/activity', methods=['GET'])
@jwt_required()
@admin_required
def get_user_activity():
    """Get user activity analytics."""
    # Date range
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # New user registrations over time
    new_users = db.session.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= start_date
    ).group_by(
        func.date(User.created_at)
    ).order_by('date').all()
    
    # Top customers by order count
    top_customers = db.session.query(
        User.id,
        User.email,
        User.first_name,
        User.last_name,
        func.count(Order.id).label('order_count'),
        func.sum(Order.total).label('total_spent')
    ).join(Order).filter(
        Order.payment_status == PaymentStatus.PAID.value
    ).group_by(
        User.id, User.email, User.first_name, User.last_name
    ).order_by(desc('total_spent')).limit(10).all()
    
    return jsonify({
        'new_users_by_date': [
            {
                'date': str(day.date),
                'count': day.count
            }
            for day in new_users
        ],
        'top_customers': [
            {
                'id': u.id,
                'email': u.email,
                'name': f'{u.first_name or ""} {u.last_name or ""}'.strip() or 'N/A',
                'order_count': u.order_count,
                'total_spent': float(u.total_spent or 0)
            }
            for u in top_customers
        ]
    }), 200
