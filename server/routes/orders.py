from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.order import Order, OrderItem
from models.product import Product
from models.user import User
from datetime import datetime
from decimal import Decimal

orders_bp = Blueprint('orders', __name__)


@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order for the current authenticated user."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}

    items = data.get('items', [])
    subtotal = Decimal(str(data.get('subtotal', 0)))
    tax = Decimal(str(data.get('tax', 0)))
    shipping_cost = Decimal(str(data.get('shipping_cost', 0)))
    discount = Decimal(str(data.get('discount', 0)))
    total = Decimal(str(data.get('total', subtotal + tax + shipping_cost - discount)))

    # Shipping fields
    shipping = data.get('shipping_address', {})

    order = Order(
        order_number=f"ORD-{int(datetime.utcnow().timestamp())}",
        user_id=user.id,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        discount=discount,
        total=total,
        shipping_name=shipping.get('fullName') or shipping.get('name'),
        shipping_street=shipping.get('address') or shipping.get('street'),
        shipping_city=shipping.get('city'),
        shipping_state=shipping.get('state'),
        shipping_postal_code=shipping.get('zipCode') or shipping.get('postal_code'),
        shipping_country=shipping.get('country'),
        shipping_phone=shipping.get('phone'),
        customer_notes=data.get('customer_notes')
    )

    db.session.add(order)
    db.session.flush()  # ensure order.id is available

    # Add items
    for it in items:
        # Expect item to contain product_id, name, image, quantity, unit_price
        unit_price = Decimal(str(it.get('unit_price') or it.get('price') or 0))
        quantity = int(it.get('quantity', 1))
        total_price = unit_price * quantity

        order_item = OrderItem(
            order_id=order.id,
            product_id=it.get('product_id') or it.get('id'),
            product_name=it.get('name'),
            product_sku=it.get('sku'),
            product_image=it.get('image'),
            quantity=quantity,
            unit_price=unit_price,
            total_price=total_price
        )

        db.session.add(order_item)

    db.session.commit()

    return jsonify({'order': order.to_dict()}), 201


@orders_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_orders():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify({'orders': [o.to_dict() for o in orders]}), 200
