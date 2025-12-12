from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from extensions import db, redis_client
from config import config
import os

def create_app(config_name='development'):
    """Application factory."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    jwt = JWTManager(app)

    # JWT error handlers for clearer debugging
    from flask import jsonify

    @jwt.unauthorized_loader
    def on_unauthorized(msg):
        print('JWT unauthorized:', msg)
        return jsonify({'error': msg}), 401

    @jwt.invalid_token_loader
    def on_invalid_token(msg):
        print('JWT invalid token:', msg)
        return jsonify({'error': msg}), 422

    @jwt.expired_token_loader
    def on_expired_token(jwt_header, jwt_payload):
        print('JWT expired token')
        return jsonify({'error': 'Token has expired'}), 401

    @jwt.revoked_token_loader
    def on_revoked(jwt_header, jwt_payload):
        print('JWT revoked token')
        return jsonify({'error': 'Token has been revoked'}), 401
    
    # Create upload folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.admin.products import admin_products_bp
    from routes.admin.categories import admin_categories_bp
    from routes.admin.orders import admin_orders_bp
    from routes.admin.users import admin_users_bp
    from routes.admin.analytics import admin_analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_products_bp, url_prefix='/api/admin/products')
    app.register_blueprint(admin_categories_bp, url_prefix='/api/admin/categories')
    app.register_blueprint(admin_orders_bp, url_prefix='/api/admin/orders')
    app.register_blueprint(admin_users_bp, url_prefix='/api/admin/users')
    app.register_blueprint(admin_analytics_bp, url_prefix='/api/admin/analytics')

    # Serve product images from uploads/products at /products/<filename>
    @app.route('/products/<path:filename>')
    def serve_product_image(filename):
        # Directory where product images are stored
        products_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'products')
        return send_from_directory(products_dir, filename)
    
    # Serve uploaded files (categories, products, etc.) using their folder name
    # e.g. /categories/<filename> or /products/<filename>
    @app.route('/<folder>/<path:filename>')
    def serve_uploaded_file(folder, filename):
        # Only serve from existing upload subfolders for safety
        upload_subdir = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        if not os.path.isdir(upload_subdir):
            return "Not found", 404
        return send_from_directory(upload_subdir, filename)
    # Create tables and seed admin user
    with app.app_context():
        db.create_all()
        seed_admin_user(app)
    
    return app


def seed_admin_user(app):
    """Create default admin user if not exists."""
    from models.user import User
    
    admin_email = app.config['ADMIN_EMAIL']
    admin = User.query.filter_by(email=admin_email).first()
    
    if not admin:
        admin = User(
            email=admin_email,
            username='admin',
            first_name='Admin',
            last_name='User',
            is_admin=True
        )
        admin.set_password(app.config['ADMIN_PASSWORD'])
        db.session.add(admin)
        db.session.commit()
        print(f'Admin user created: {admin_email}')


if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    app.run(host='0.0.0.0', port=5000, debug=True)
