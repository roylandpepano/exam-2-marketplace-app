"""
PayPal Payment Routes
Handles PayPal Sandbox payment integration for order processing.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import paypalrestsdk
from config import Config
from extensions import db
from models.order import Order, OrderItem, PaymentStatus, OrderStatus
from models.user import User
from decimal import Decimal
from datetime import datetime

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/paypal/create-order', methods=['POST'])
@jwt_required()
def create_paypal_order():
    """
    Create a PayPal order for the checkout.
    Expects: { items, subtotal, tax, shipping_cost, discount, total, shipping_address }
    Returns: { order_id } - PayPal order ID for client approval
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    
    items = data.get('items', [])
    total = float(data.get('total', 0))
    subtotal = float(data.get('subtotal', 0))
    tax = float(data.get('tax', 0))
    shipping_cost = float(data.get('shipping_cost', 0))

    if not items or total <= 0:
        return jsonify({'error': 'Invalid order data'}), 400

    # Build PayPal items array
    paypal_items = []
    for item in items:
        paypal_items.append({
            "name": item.get('name', 'Product'),
            "sku": str(item.get('id', '')),
            "price": str(round(item.get('unit_price', 0), 2)),
            "currency": "USD",
            "quantity": item.get('quantity', 1)
        })

    # Create PayPal payment
    payment = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": f"{Config.CLIENT_URL}/checkout/success",
            "cancel_url": f"{Config.CLIENT_URL}/checkout/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": paypal_items
            },
            "amount": {
                "total": str(round(total, 2)),
                "currency": "USD",
                "details": {
                    "subtotal": str(round(subtotal, 2)),
                    "tax": str(round(tax, 2)),
                    "shipping": str(round(shipping_cost, 2))
                }
            },
            "description": f"Order for {user.email}"
        }]
    })

    if payment.create():
        # Find approval URL
        approval_url = None
        for link in payment.links:
            if link.rel == "approval_url":
                approval_url = link.href
                break
        
        return jsonify({
            'payment_id': payment.id,
            'approval_url': approval_url
        }), 200
    else:
        return jsonify({'error': 'PayPal payment creation failed', 'details': payment.error}), 400


@payments_bp.route('/paypal/capture-order', methods=['POST'])
@jwt_required()
def capture_paypal_order():
    """
    Execute PayPal payment after user approval and create order in database.
    Expects: { payment_id, payer_id, order_data }
    Returns: { order } - Created order object
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    payment_id = data.get('payment_id')
    payer_id = data.get('payer_id')
    order_data = data.get('order_data', {})

    if not payment_id or not payer_id:
        return jsonify({'error': 'Missing payment_id or payer_id'}), 400

    # Execute the payment
    payment = paypalrestsdk.Payment.find(payment_id)
    
    if payment.execute({"payer_id": payer_id}):
        # Payment successful - create order in database
        items = order_data.get('items', [])
        subtotal = Decimal(str(order_data.get('subtotal', 0)))
        tax = Decimal(str(order_data.get('tax', 0)))
        shipping_cost = Decimal(str(order_data.get('shipping_cost', 0)))
        discount = Decimal(str(order_data.get('discount', 0)))
        total = Decimal(str(order_data.get('total', 0)))
        
        shipping = order_data.get('shipping_address', {})

        order = Order(
            order_number=f"ORD-{int(datetime.utcnow().timestamp())}",
            user_id=user.id,
            subtotal=subtotal,
            tax=tax,
            shipping_cost=shipping_cost,
            discount=discount,
            total=total,
            status=OrderStatus.CONFIRMED.value,
            payment_status=PaymentStatus.PAID.value,
            shipping_name=shipping.get('fullName') or shipping.get('name'),
            shipping_street=shipping.get('address') or shipping.get('street'),
            shipping_city=shipping.get('city'),
            shipping_state=shipping.get('state'),
            shipping_postal_code=shipping.get('zipCode') or shipping.get('postal_code'),
            shipping_country=shipping.get('country', 'US'),
            shipping_phone=shipping.get('phone'),
            customer_notes=order_data.get('customer_notes'),
            confirmed_at=datetime.utcnow()
        )

        db.session.add(order)
        db.session.flush()

        # Add order items
        for it in items:
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

        return jsonify({
            'order': order.to_dict(),
            'payment_id': payment_id,
            'status': 'success'
        }), 201
    else:
        return jsonify({'error': 'Payment execution failed', 'details': payment.error}), 400


@payments_bp.route('/paypal/webhook', methods=['POST'])
def paypal_webhook():
    """
    Handle PayPal IPN/webhook notifications.
    This endpoint can be used for real-time payment status updates.
    """
    # In production, verify webhook signature
    data = request.get_json() or {}
    
    # Log webhook for debugging
    print(f"PayPal Webhook received: {data}")
    
    # Handle different event types
    event_type = data.get('event_type')
    
    if event_type == 'PAYMENT.SALE.COMPLETED':
        # Payment completed
        pass
    elif event_type == 'PAYMENT.SALE.REFUNDED':
        # Payment refunded
        pass
    
    return jsonify({'status': 'received'}), 200
