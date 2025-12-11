from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.product import Product
from models.category import Category
from extensions import db
from utils.auth import admin_required
from utils.helpers import save_image, delete_image, generate_slug
from utils.cache import invalidate_cache
from sqlalchemy import or_

admin_products_bp = Blueprint('admin_products', __name__)


@admin_products_bp.route('', methods=['GET'])
@jwt_required()
@admin_required
def get_products():
    """Get all products with filtering and pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    category_id = request.args.get('category_id', type=int)
    is_active = request.args.get('is_active', type=str)
    is_featured = request.args.get('is_featured', type=str)
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Build query
    query = Product.query
    
    # Apply filters
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{search}%'),
                Product.sku.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%')
            )
        )
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if is_active == 'true':
        query = query.filter_by(is_active=True)
    elif is_active == 'false':
        query = query.filter_by(is_active=False)
    
    if is_featured == 'true':
        query = query.filter_by(is_featured=True)
    elif is_featured == 'false':
        query = query.filter_by(is_featured=False)
    
    # Apply sorting
    if hasattr(Product, sort_by):
        order_col = getattr(Product, sort_by)
        query = query.order_by(order_col.desc() if sort_order == 'desc' else order_col.asc())
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'products': [p.to_dict() for p in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200


@admin_products_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_product(product_id):
    """Get single product by ID."""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify({
        'product': product.to_dict()
    }), 200


@admin_products_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_product():
    """Create a new product."""
    data = request.form.to_dict()
    
    # Validate required fields
    required_fields = ['name', 'price']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Generate slug if not provided
    slug = data.get('slug') or generate_slug(data['name'])
    
    # Check if slug already exists
    if Product.query.filter_by(slug=slug).first():
        return jsonify({'error': 'Product with this slug already exists'}), 409
    
    # Handle image upload
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file.filename:
            image_url = save_image(file, folder='products')
    
    # Handle additional images
    images = []
    if 'images' in request.files:
        files = request.files.getlist('images')
        for file in files:
            if file.filename:
                img_path = save_image(file, folder='products')
                if img_path:
                    images.append(img_path)
    
    # Create product
    product = Product(
        name=data['name'],
        slug=slug,
        description=data.get('description'),
        short_description=data.get('short_description'),
        price=float(data['price']),
        compare_at_price=float(data['compare_at_price']) if data.get('compare_at_price') else None,
        cost=float(data['cost']) if data.get('cost') else None,
        sku=data.get('sku'),
        barcode=data.get('barcode'),
        stock_quantity=int(data.get('stock_quantity', 0)),
        low_stock_threshold=int(data.get('low_stock_threshold', 10)),
        track_inventory=data.get('track_inventory', 'true').lower() == 'true',
        category_id=int(data['category_id']) if data.get('category_id') else None,
        brand=data.get('brand'),
        tags=data.get('tags'),
        image_url=image_url,
        images=images,
        meta_title=data.get('meta_title'),
        meta_description=data.get('meta_description'),
        is_active=data.get('is_active', 'true').lower() == 'true',
        is_featured=data.get('is_featured', 'false').lower() == 'true'
    )
    
    db.session.add(product)
    db.session.commit()
    
    # Invalidate cache
    invalidate_cache('products')
    
    return jsonify({
        'message': 'Product created successfully',
        'product': product.to_dict()
    }), 201


@admin_products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_product(product_id):
    """Update a product."""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    data = request.form.to_dict()
    
    # Update slug if name changed
    if 'name' in data and data['name'] != product.name:
        slug = data.get('slug') or generate_slug(data['name'])
        # Check if new slug is unique
        existing = Product.query.filter_by(slug=slug).filter(Product.id != product_id).first()
        if existing:
            return jsonify({'error': 'Product with this slug already exists'}), 409
        product.slug = slug
    
    # Handle image upload
    if 'image' in request.files:
        file = request.files['image']
        if file.filename:
            # Delete old image
            if product.image_url:
                delete_image(product.image_url)
            # Save new image
            product.image_url = save_image(file, folder='products')
    
    # Handle additional images
    if 'images' in request.files:
        files = request.files.getlist('images')
        new_images = []
        for file in files:
            if file.filename:
                img_path = save_image(file, folder='products')
                if img_path:
                    new_images.append(img_path)
        if new_images:
            # Delete old additional images
            if product.images:
                for img in product.images:
                    delete_image(img)
            product.images = new_images
    
    # Update fields
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'short_description' in data:
        product.short_description = data['short_description']
    if 'price' in data:
        product.price = float(data['price'])
    if 'compare_at_price' in data:
        product.compare_at_price = float(data['compare_at_price']) if data['compare_at_price'] else None
    if 'cost' in data:
        product.cost = float(data['cost']) if data['cost'] else None
    if 'sku' in data:
        product.sku = data['sku']
    if 'barcode' in data:
        product.barcode = data['barcode']
    if 'stock_quantity' in data:
        product.stock_quantity = int(data['stock_quantity'])
    if 'low_stock_threshold' in data:
        product.low_stock_threshold = int(data['low_stock_threshold'])
    if 'track_inventory' in data:
        product.track_inventory = data['track_inventory'].lower() == 'true'
    if 'category_id' in data:
        product.category_id = int(data['category_id']) if data['category_id'] else None
    if 'brand' in data:
        product.brand = data['brand']
    if 'tags' in data:
        product.tags = data['tags']
    if 'meta_title' in data:
        product.meta_title = data['meta_title']
    if 'meta_description' in data:
        product.meta_description = data['meta_description']
    if 'is_active' in data:
        product.is_active = data['is_active'].lower() == 'true'
    if 'is_featured' in data:
        product.is_featured = data['is_featured'].lower() == 'true'
    
    db.session.commit()
    
    # Invalidate cache
    invalidate_cache('products')
    
    return jsonify({
        'message': 'Product updated successfully',
        'product': product.to_dict()
    }), 200


@admin_products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_product(product_id):
    """Delete a product."""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    # Delete images
    if product.image_url:
        delete_image(product.image_url)
    if product.images:
        for img in product.images:
            delete_image(img)
    
    db.session.delete(product)
    db.session.commit()
    
    # Invalidate cache
    invalidate_cache('products')
    
    return jsonify({
        'message': 'Product deleted successfully'
    }), 200


@admin_products_bp.route('/bulk-delete', methods=['POST'])
@jwt_required()
@admin_required
def bulk_delete_products():
    """Delete multiple products."""
    data = request.get_json()
    product_ids = data.get('product_ids', [])
    
    if not product_ids:
        return jsonify({'error': 'No product IDs provided'}), 400
    
    products = Product.query.filter(Product.id.in_(product_ids)).all()
    
    for product in products:
        # Delete images
        if product.image_url:
            delete_image(product.image_url)
        if product.images:
            for img in product.images:
                delete_image(img)
        db.session.delete(product)
    
    db.session.commit()
    
    # Invalidate cache
    invalidate_cache('products')
    
    return jsonify({
        'message': f'{len(products)} products deleted successfully'
    }), 200


@admin_products_bp.route('/bulk-update', methods=['POST'])
@jwt_required()
@admin_required
def bulk_update_products():
    """Update multiple products at once."""
    data = request.get_json()
    product_ids = data.get('product_ids', [])
    updates = data.get('updates', {})
    
    if not product_ids:
        return jsonify({'error': 'No product IDs provided'}), 400
    
    if not updates:
        return jsonify({'error': 'No updates provided'}), 400
    
    products = Product.query.filter(Product.id.in_(product_ids)).all()
    
    for product in products:
        for key, value in updates.items():
            if hasattr(product, key):
                setattr(product, key, value)
    
    db.session.commit()
    
    # Invalidate cache
    invalidate_cache('products')
    
    return jsonify({
        'message': f'{len(products)} products updated successfully'
    }), 200
