from flask import Blueprint, jsonify
from models.constant import Constant

constants_bp = Blueprint('constants', __name__)


@constants_bp.route('', methods=['GET'])
def get_constants():
    """Public endpoint to fetch all constants as key => value map."""
    consts = Constant.query.all()
    data = {c.key: c.value for c in consts}
    return jsonify({'constants': data}), 200
