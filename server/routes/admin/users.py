from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.user import User
from models.order import Order
from extensions import db
from utils.auth import admin_required
from sqlalchemy import or_

admin_users_bp = Blueprint('admin_users', __name__)


@admin_users_bp.route('', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users with filtering and pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    is_admin = request.args.get('is_admin', type=str)
    is_active = request.args.get('is_active', type=str)
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Build query
    query = User.query
    
    # Apply filters
    if search:
        query = query.filter(
            or_(
                User.email.ilike(f'%{search}%'),
                User.username.ilike(f'%{search}%'),
                User.first_name.ilike(f'%{search}%'),
                User.last_name.ilike(f'%{search}%')
            )
        )
    
    if is_admin == 'true':
        query = query.filter_by(is_admin=True)
    elif is_admin == 'false':
        query = query.filter_by(is_admin=False)
    
    if is_active == 'true':
        query = query.filter_by(is_active=True)
    elif is_active == 'false':
        query = query.filter_by(is_active=False)
    
    # Apply sorting
    if hasattr(User, sort_by):
        order_col = getattr(User, sort_by)
        query = query.order_by(order_col.desc() if sort_order == 'desc' else order_col.asc())
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Add order count for each user
    users_data = []
    for user in pagination.items:
        user_dict = user.to_dict()
        user_dict['order_count'] = user.orders.count()
        users_data.append(user_dict)
    
    return jsonify({
        'users': users_data,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200


@admin_users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_user(user_id):
    """Get single user by ID."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user.to_dict()
    user_data['order_count'] = user.orders.count()
    user_data['addresses'] = [addr.to_dict() for addr in user.addresses]
    
    # Get recent orders
    recent_orders = user.orders.order_by(Order.created_at.desc()).limit(5).all()
    user_data['recent_orders'] = [order.to_dict(include_items=False) for order in recent_orders]
    
    return jsonify({
        'user': user_data
    }), 200


@admin_users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    """Update user information."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'email' in data and data['email'] != user.email:
        # Check if email is already taken
        existing = User.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({'error': 'Email already in use'}), 409
        user.email = data['email']
    
    if 'username' in data and data['username'] != user.username:
        # Check if username is already taken
        existing = User.query.filter_by(username=data['username']).first()
        if existing:
            return jsonify({'error': 'Username already taken'}), 409
        user.username = data['username']
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone' in data:
        user.phone = data['phone']
    if 'is_admin' in data:
        user.is_admin = data['is_admin']
    if 'is_active' in data:
        user.is_active = data['is_active']
    
    # Update password if provided
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'User updated successfully',
        'user': user.to_dict()
    }), 200


@admin_users_bp.route('/<int:user_id>/toggle-admin', methods=['POST'])
@jwt_required()
@admin_required
def toggle_admin(user_id):
    """Toggle user admin status."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.is_admin = not user.is_admin
    db.session.commit()
    
    return jsonify({
        'message': f'User {"promoted to" if user.is_admin else "demoted from"} admin',
        'user': user.to_dict()
    }), 200


@admin_users_bp.route('/<int:user_id>/toggle-active', methods=['POST'])
@jwt_required()
@admin_required
def toggle_active(user_id):
    """Toggle user active status."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.is_active = not user.is_active
    db.session.commit()
    
    return jsonify({
        'message': f'User {"activated" if user.is_active else "deactivated"}',
        'user': user.to_dict()
    }), 200


@admin_users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Delete a user (use with caution)."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Prevent deleting users with orders
    if user.orders.count() > 0:
        return jsonify({
            'error': f'Cannot delete user with {user.orders.count()} orders. Deactivate instead.'
        }), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User deleted successfully'
    }), 200


@admin_users_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_user_stats():
    """Get user statistics."""
    stats = {
        'total_users': User.query.count(),
        'active_users': User.query.filter_by(is_active=True).count(),
        'inactive_users': User.query.filter_by(is_active=False).count(),
        'admin_users': User.query.filter_by(is_admin=True).count(),
        'regular_users': User.query.filter_by(is_admin=False).count()
    }
    
    return jsonify(stats), 200
