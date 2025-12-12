from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.constant import Constant
from models.user import User

admin_constants_bp = Blueprint('admin_constants', __name__)


def _require_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not getattr(user, 'is_admin', False):
        return None
    return user


@admin_constants_bp.route('', methods=['GET'])
@jwt_required()
def list_constants():
    if not _require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    consts = Constant.query.order_by(Constant.key).all()
    return jsonify({'constants': [c.to_dict() for c in consts]}), 200


@admin_constants_bp.route('', methods=['PUT'])
@jwt_required()
def update_constants():
    if not _require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    data = request.get_json() or {}
    # expect { key: value, ... }
    updated = []
    for key, value in data.items():
        c = Constant.query.filter_by(key=key).first()
        if c:
            c.value = str(value)
        else:
            c = Constant(key=key, value=str(value))
            db.session.add(c)
        updated.append(c)

    db.session.commit()
    return jsonify({'constants': {c.key: c.value for c in updated}}), 200
