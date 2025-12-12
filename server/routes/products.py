from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models.product import Product
from models.rating import ProductRating
from extensions import db
from sqlalchemy import or_
from utils.cache import invalidate_cache

products_bp = Blueprint('products', __name__)


@products_bp.route('', methods=['GET'])
def get_products():
    """Public endpoint: Get products with optional filtering and pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    category_id = request.args.get('category_id', type=int)
    is_active = request.args.get('is_active', type=str)
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')

    query = Product.query

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

    if hasattr(Product, sort_by):
        order_col = getattr(Product, sort_by)
        query = query.order_by(order_col.desc() if sort_order == 'desc' else order_col.asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    # Try to detect authenticated user (optional) so we can include user's own rating
    user_id = None
    try:
        try:
            verify_jwt_in_request(optional=True)
        except TypeError:
            # older versions of flask_jwt_extended may not support `optional`
            verify_jwt_in_request()
        user_id = get_jwt_identity()
        if user_id is not None:
            user_id = int(user_id)
    except Exception:
        user_id = None

    products_list = []
    for p in pagination.items:
        d = p.to_dict()
        if user_id:
            ur = ProductRating.query.filter_by(product_id=p.id, user_id=user_id).first()
            d['your_rating'] = ur.rating if ur else None
        else:
            d['your_rating'] = None
        products_list.append(d)

    return jsonify({
        'products': products_list,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Public endpoint: Get single product by ID."""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    # Optionally include the authenticated user's rating
    user_id = None
    try:
        try:
            verify_jwt_in_request(optional=True)
        except TypeError:
            verify_jwt_in_request()
        user_id = get_jwt_identity()
        if user_id is not None:
            user_id = int(user_id)
    except Exception:
        user_id = None

    d = product.to_dict()
    if user_id:
        ur = ProductRating.query.filter_by(product_id=product.id, user_id=user_id).first()
        d['your_rating'] = ur.rating if ur else None
    else:
        d['your_rating'] = None

    return jsonify({'product': d}), 200



@products_bp.route('/<int:product_id>/rate', methods=['POST'])
@jwt_required()
def rate_product(product_id):
    """Authenticated endpoint: rate a product (1-5)."""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json() or {}
    try:
        rating_value = int(data.get('rating', 0))
    except Exception:
        return jsonify({'error': 'Invalid rating value'}), 400

    if rating_value < 1 or rating_value > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    user_id = get_jwt_identity()
    try:
        user_id_int = int(user_id)
    except Exception:
        # Fallback if stored differently
        return jsonify({'error': 'Invalid user identity'}), 400

    existing = ProductRating.query.filter_by(product_id=product.id, user_id=user_id_int).first()
    if existing:
        existing.rating = rating_value
    else:
        pr = ProductRating(product_id=product.id, user_id=user_id_int, rating=rating_value)
        db.session.add(pr)

    db.session.commit()

    # Invalidate cached product listings if any
    try:
        invalidate_cache('products')
    except Exception:
        pass

    # Reload product so relationship reflects new rating
    product = Product.query.get(product_id)

    d = product.to_dict()
    # include the user's rating in response
    try:
        user_id = get_jwt_identity()
        if user_id is not None:
            ur = ProductRating.query.filter_by(product_id=product.id, user_id=int(user_id)).first()
            d['your_rating'] = ur.rating if ur else None
        else:
            d['your_rating'] = None
    except Exception:
        d['your_rating'] = None

    return jsonify({'product': d}), 200
