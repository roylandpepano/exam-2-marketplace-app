# Admin routes package
from routes.admin.products import admin_products_bp
from routes.admin.categories import admin_categories_bp
from routes.admin.orders import admin_orders_bp
from routes.admin.users import admin_users_bp
from routes.admin.analytics import admin_analytics_bp

__all__ = [
    'admin_products_bp',
    'admin_categories_bp',
    'admin_orders_bp',
    'admin_users_bp',
    'admin_analytics_bp'
]
