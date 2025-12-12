from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.order import Order, OrderItem, OrderStatus, PaymentStatus
from models.product import Product
from models.user import User
from extensions import db
from utils.auth import admin_required
from datetime import datetime
from sqlalchemy import or_

admin_orders_bp = Blueprint('admin_orders', __name__)


@admin_orders_bp.route('', methods=['GET'])
@jwt_required()
@admin_required
def get_orders():
    """Get all orders with filtering and pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    payment_status = request.args.get('payment_status', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Build query
    query = Order.query
    
    # Apply filters
    if search:
        query = query.filter(
            or_(
                Order.order_number.ilike(f'%{search}%'),
                Order.shipping_name.ilike(f'%{search}%'),
                Order.tracking_number.ilike(f'%{search}%')
            )
        )
    
    if status:
        query = query.filter_by(status=status)
    
    if payment_status:
        query = query.filter_by(payment_status=payment_status)
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(Order.created_at >= start)
        except ValueError:
            pass
    
    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(Order.created_at <= end)
        except ValueError:
            pass
    
    # Apply sorting
    if hasattr(Order, sort_by):
        order_col = getattr(Order, sort_by)
        query = query.order_by(order_col.desc() if sort_order == 'desc' else order_col.asc())
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'orders': [o.to_dict(include_user=True) for o in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200


@admin_orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_order(order_id):
    """Get single order by ID."""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    return jsonify({
        'order': order.to_dict(include_user=True)
    }), 200


@admin_orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_order_status(order_id):
    """Update order status."""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({'error': 'Status is required'}), 400
    
    # Validate status
    valid_statuses = [s.value for s in OrderStatus]
    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    # Update timestamps based on status and adjust inventory on shipment
    if new_status == OrderStatus.CONFIRMED.value and not order.confirmed_at:
        order.confirmed_at = datetime.utcnow()
    elif new_status == OrderStatus.SHIPPED.value and not order.shipped_at:
        order.shipped_at = datetime.utcnow()
        # Reduce stock for each order item when order is shipped
        for item in order.items:
            product = Product.query.get(item.product_id)
            if not product:
                continue
            if not product.track_inventory:
                continue
            try:
                qty = int(item.quantity or 0)
            except Exception:
                qty = 0
            if product.stock_quantity is None:
                product.stock_quantity = 0
            product.stock_quantity = max(product.stock_quantity - qty, 0)
            # increment sales count
            product.sales_count = (product.sales_count or 0) + qty
            db.session.add(product)
    elif new_status == OrderStatus.DELIVERED.value and not order.delivered_at:
        order.delivered_at = datetime.utcnow()
    
    order.status = new_status
    db.session.commit()
    
    return jsonify({
        'message': 'Order status updated successfully',
        'order': order.to_dict()
    }), 200


@admin_orders_bp.route('/<int:order_id>/payment-status', methods=['PUT'])
@jwt_required()
@admin_required
def update_payment_status(order_id):
    """Update order payment status."""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    new_status = data.get('payment_status')
    
    if not new_status:
        return jsonify({'error': 'Payment status is required'}), 400
    
    # Validate payment status
    valid_statuses = [s.value for s in PaymentStatus]
    if new_status not in valid_statuses:
        return jsonify({'error': f'Invalid payment status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    order.payment_status = new_status
    db.session.commit()
    
    return jsonify({
        'message': 'Payment status updated successfully',
        'order': order.to_dict()
    }), 200


@admin_orders_bp.route('/<int:order_id>/shipping', methods=['PUT'])
@jwt_required()
@admin_required
def update_shipping_info(order_id):
    """Update order shipping information."""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    
    # Update shipping fields
    if 'tracking_number' in data:
        order.tracking_number = data['tracking_number']
    if 'carrier' in data:
        order.carrier = data['carrier']
    if 'estimated_delivery' in data:
        try:
            order.estimated_delivery = datetime.fromisoformat(data['estimated_delivery'])
        except ValueError:
            pass
    
    db.session.commit()
    
    return jsonify({
        'message': 'Shipping information updated successfully',
        'order': order.to_dict()
    }), 200


@admin_orders_bp.route('/<int:order_id>/notes', methods=['PUT'])
@jwt_required()
@admin_required
def update_order_notes(order_id):
    """Update order admin notes."""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    
    if 'admin_notes' in data:
        order.admin_notes = data['admin_notes']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Order notes updated successfully',
        'order': order.to_dict()
    }), 200


@admin_orders_bp.route('/<int:order_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_order(order_id):
    """Delete an order (use with caution)."""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Only allow deletion of cancelled orders
    if order.status not in [OrderStatus.CANCELLED.value, OrderStatus.PENDING.value]:
        return jsonify({
            'error': 'Only cancelled or pending orders can be deleted'
        }), 400
    
    db.session.delete(order)
    db.session.commit()
    
    return jsonify({
        'message': 'Order deleted successfully'
    }), 200


@admin_orders_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_order_stats():
    """Get order statistics."""
    # Count orders by status
    stats = {
        'total_orders': Order.query.count(),
        'by_status': {},
        'by_payment_status': {}
    }
    
    for status in OrderStatus:
        count = Order.query.filter_by(status=status.value).count()
        stats['by_status'][status.value] = count
    
    for payment_status in PaymentStatus:
        count = Order.query.filter_by(payment_status=payment_status.value).count()
        stats['by_payment_status'][payment_status.value] = count
    
    # Calculate revenue
    from sqlalchemy import func
    revenue_data = db.session.query(
        func.sum(Order.total).label('total_revenue'),
        func.sum(Order.subtotal).label('total_subtotal'),
        func.sum(Order.tax).label('total_tax'),
        func.sum(Order.shipping_cost).label('total_shipping')
    ).filter(Order.payment_status == PaymentStatus.PAID.value).first()
    
    stats['revenue'] = {
        'total': float(revenue_data.total_revenue or 0),
        'subtotal': float(revenue_data.total_subtotal or 0),
        'tax': float(revenue_data.total_tax or 0),
        'shipping': float(revenue_data.total_shipping or 0)
    }
    
    return jsonify(stats), 200
