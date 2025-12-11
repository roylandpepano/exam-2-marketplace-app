from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.category import Category
from models.product import Product
from extensions import db
from utils.auth import admin_required
from utils.helpers import save_image, delete_image, generate_slug
from utils.cache import invalidate_cache

admin_categories_bp = Blueprint('admin_categories', __name__)


@admin_categories_bp.route('', methods=['GET'])
@jwt_required()
@admin_required
def get_categories():
    """Get all categories."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    search = request.args.get('search', '')
    is_active = request.args.get('is_active', type=str)
    
    # Build query
    query = Category.query
    
    # Apply filters
    if search:
        query = query.filter(Category.name.ilike(f'%{search}%'))
    
    if is_active == 'true':
        query = query.filter_by(is_active=True)
    elif is_active == 'false':
        query = query.filter_by(is_active=False)
    
    # Order by display_order, then name
    query = query.order_by(Category.display_order.asc(), Category.name.asc())
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'categories': [c.to_dict() for c in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200


@admin_categories_bp.route('/<int:category_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_category(category_id):
    """Get single category by ID."""
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    return jsonify({
        'category': category.to_dict(include_products=True)
    }), 200


@admin_categories_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_category():
    """Create a new category."""
    data = request.form.to_dict()
    
    # Validate required fields
    if 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    
    # Generate slug if not provided
    slug = data.get('slug') or generate_slug(data['name'])
    
    # Check if slug already exists
    if Category.query.filter_by(slug=slug).first():
        return jsonify({'error': 'Category with this slug already exists'}), 409
    
    # Handle image upload
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file.filename:
            image_url = save_image(file, folder='categories')
    
    # Create category
    category = Category(
        name=data['name'],
        slug=slug,
        description=data.get('description'),
        image_url=image_url,
        is_active=data.get('is_active', 'true').lower() == 'true',
        display_order=int(data.get('display_order', 0))
    )
    
    db.session.add(category)
    db.session.commit()
    
    # Invalidate cache
    invalidate_cache('categories')
    
    return jsonify({
        'message': 'Category created successfully',
        'category': category.to_dict()
    }), 201


@admin_categories_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_category(category_id):
    """Update a category."""
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    data = request.form.to_dict()
    
    # Update slug if name changed
    if 'name' in data and data['name'] != category.name:
        slug = data.get('slug') or generate_slug(data['name'])
        # Check if new slug is unique
        existing = Category.query.filter_by(slug=slug).filter(Category.id != category_id).first()
        if existing:
            return jsonify({'error': 'Category with this slug already exists'}), 409
        category.slug = slug
    
    # Handle image upload
    if 'image' in request.files:
        file = request.files['image']
        if file.filename:
            # Delete old image
            if category.image_url:
                delete_image(category.image_url)
            # Save new image
            category.image_url = save_image(file, folder='categories')
    
    # Update fields
    if 'name' in data:
        category.name = data['name']
    if 'description' in data:
        category.description = data['description']
    if 'is_active' in data:
        category.is_active = data['is_active'].lower() == 'true'
    if 'display_order' in data:
        category.display_order = int(data['display_order'])
    
    db.session.commit()
    
    # Invalidate cache
    invalidate_cache('categories')
    
    return jsonify({
        'message': 'Category updated successfully',
        'category': category.to_dict()
    }), 200


@admin_categories_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_category(category_id):
    """Delete a category."""
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    # Check if category has products
    if category.products.count() > 0:
        return jsonify({
            'error': f'Cannot delete category with {category.products.count()} products. Please reassign or delete products first.'
        }), 400
    
    # Delete image
    if category.image_url:
        delete_image(category.image_url)
    
    db.session.delete(category)
    db.session.commit()
    
    # Invalidate cache
    invalidate_cache('categories')
    
    return jsonify({
        'message': 'Category deleted successfully'
    }), 200


@admin_categories_bp.route('/reorder', methods=['POST'])
@jwt_required()
@admin_required
def reorder_categories():
    """Reorder categories by updating display_order."""
    data = request.get_json()
    category_orders = data.get('categories', [])  # List of {id: int, display_order: int}
    
    if not category_orders:
        return jsonify({'error': 'No category orders provided'}), 400
    
    for item in category_orders:
        category = Category.query.get(item['id'])
        if category:
            category.display_order = item['display_order']
    
    db.session.commit()
    
    # Invalidate cache
    invalidate_cache('categories')
    
    return jsonify({
        'message': 'Categories reordered successfully'
    }), 200
