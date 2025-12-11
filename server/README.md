# Marketplace Admin Panel - Backend

A comprehensive Flask-based backend API for marketplace admin panel with PostgreSQL and Redis.

## Features

### Admin Panel

-  **Product Management**: Full CRUD operations for products with image upload support
-  **Category Management**: Create, edit, delete, and reorder categories
-  **Order Management**: View, update order status, manage shipping information
-  **User Management**: View and manage user accounts, toggle admin privileges
-  **Analytics Dashboard**: Comprehensive analytics with sales metrics, product performance, and user activity

### Tech Stack

-  **Backend**: Python 3.9+, Flask
-  **Database**: PostgreSQL with SQLAlchemy ORM
-  **Cache**: Redis for caching and session management
-  **Authentication**: JWT-based authentication
-  **Image Processing**: Pillow for image optimization

## Installation

### Prerequisites

-  Python 3.9 or higher
-  PostgreSQL 12 or higher
-  Redis server

### Setup

1. **Create a virtual environment:**

```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Edit `.env`:

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/marketplace

# Redis
REDIS_URL=redis://localhost:6379/0

# Admin (default credentials)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

4. **Set up PostgreSQL database:**

```sql
CREATE DATABASE marketplace;
```

5. **Initialize the database:**
   The database tables will be created automatically when you first run the app.

## Running the Application

### Development Mode

```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Production Mode

```bash
export FLASK_ENV=production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Documentation

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response includes `access_token` and `refresh_token`. Use the access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Admin Endpoints

All admin endpoints require authentication and admin privileges.

#### Products

-  `GET /api/admin/products` - List all products with pagination
-  `GET /api/admin/products/<id>` - Get single product
-  `POST /api/admin/products` - Create product (multipart/form-data for images)
-  `PUT /api/admin/products/<id>` - Update product
-  `DELETE /api/admin/products/<id>` - Delete product
-  `POST /api/admin/products/bulk-delete` - Delete multiple products
-  `POST /api/admin/products/bulk-update` - Update multiple products

#### Categories

-  `GET /api/admin/categories` - List all categories
-  `GET /api/admin/categories/<id>` - Get single category
-  `POST /api/admin/categories` - Create category
-  `PUT /api/admin/categories/<id>` - Update category
-  `DELETE /api/admin/categories/<id>` - Delete category
-  `POST /api/admin/categories/reorder` - Reorder categories

#### Orders

-  `GET /api/admin/orders` - List all orders with filtering
-  `GET /api/admin/orders/<id>` - Get single order
-  `PUT /api/admin/orders/<id>/status` - Update order status
-  `PUT /api/admin/orders/<id>/payment-status` - Update payment status
-  `PUT /api/admin/orders/<id>/shipping` - Update shipping info
-  `PUT /api/admin/orders/<id>/notes` - Update admin notes
-  `GET /api/admin/orders/stats` - Get order statistics

#### Users

-  `GET /api/admin/users` - List all users with filtering
-  `GET /api/admin/users/<id>` - Get single user with details
-  `PUT /api/admin/users/<id>` - Update user information
-  `POST /api/admin/users/<id>/toggle-admin` - Toggle admin status
-  `POST /api/admin/users/<id>/toggle-active` - Toggle active status
-  `DELETE /api/admin/users/<id>` - Delete user
-  `GET /api/admin/users/stats` - Get user statistics

#### Analytics

-  `GET /api/admin/analytics/dashboard` - Get dashboard statistics
-  `GET /api/admin/analytics/sales` - Get sales analytics over time
-  `GET /api/admin/analytics/products/performance` - Get product performance
-  `GET /api/admin/analytics/categories/performance` - Get category performance
-  `GET /api/admin/analytics/users/activity` - Get user activity analytics

## Project Structure

```
server/
├── app.py                  # Application entry point
├── config.py              # Configuration settings
├── extensions.py          # Flask extensions initialization
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── models/               # Database models
│   ├── __init__.py
│   ├── user.py          # User and Address models
│   ├── product.py       # Product model
│   ├── category.py      # Category model
│   └── order.py         # Order and OrderItem models
├── routes/              # API routes
│   ├── __init__.py
│   ├── auth.py         # Authentication routes
│   └── admin/          # Admin routes
│       ├── __init__.py
│       ├── products.py
│       ├── categories.py
│       ├── orders.py
│       ├── users.py
│       └── analytics.py
└── utils/              # Utility functions
    ├── __init__.py
    ├── auth.py         # Authentication decorators
    ├── helpers.py      # Helper functions
    └── cache.py        # Redis cache utilities
```

## Database Models

### User

-  Email, username, password (hashed)
-  Admin and active status
-  Profile information
-  Relationships: orders, addresses

### Product

-  Name, description, pricing
-  SKU, barcode
-  Inventory tracking
-  Category relationship
-  Images and media
-  SEO fields

### Category

-  Name, slug, description
-  Display order
-  Active status
-  Products relationship

### Order

-  Order number, status
-  Payment status
-  Shipping information
-  Tracking details
-  Relationships: user, items

## Default Admin Account

After first run, a default admin account is created:

-  **Email**: `admin@example.com`
-  **Password**: `admin123`

**Important**: Change these credentials in production!

## Security Features

-  JWT-based authentication
-  Password hashing with werkzeug
-  Admin-only route protection
-  CORS configuration
-  Input validation

## Caching

Redis is used for:

-  Session management
-  API response caching
-  Rate limiting (can be implemented)

Cache invalidation happens automatically when data is modified.

## Image Upload

-  Automatic image optimization and resizing
-  Multiple image support for products
-  Configurable upload folder
-  File type validation
-  Image deletion when entities are removed

## Development

### Adding New Routes

1. Create route file in `routes/` or `routes/admin/`
2. Define blueprint and routes
3. Register blueprint in `app.py`

### Database Migrations

For production, consider using Flask-Migrate:

```bash
pip install Flask-Migrate
```

## Testing

Run with test configuration:

```bash
export FLASK_ENV=testing
python -m pytest
```

## Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker

(Add Dockerfile if needed)

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.
