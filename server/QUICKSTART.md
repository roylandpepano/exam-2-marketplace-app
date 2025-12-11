# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:

-  ✓ Python 3.9+ installed
-  ✓ PostgreSQL installed and running
-  ✓ Redis installed and running

## Step-by-Step Setup

### 1. Create Virtual Environment

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up PostgreSQL Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE marketplace;

-- Create user (optional)
CREATE USER marketplace_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE marketplace TO marketplace_user;

-- Exit
\q
```

### 4. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` file:

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-this
JWT_SECRET_KEY=your-jwt-secret-change-this

# Update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/marketplace

# Redis (default should work if Redis is running locally)
REDIS_URL=redis://localhost:6379/0

# Admin credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 5. Initialize Database

```bash
python init_db.py
```

This will:

-  Create all database tables
-  Create the default admin user
-  Display login credentials

### 6. (Optional) Add Sample Data

```bash
python init_db.py --seed
```

This adds sample categories and products for testing.

### 7. Start the Server

```bash
python app.py
```

The server will start at `http://localhost:5000`

## Testing the API

### 1. Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the `access_token` from the response.

### 2. Test Admin Endpoints

```bash
# Get all products
curl -X GET http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get dashboard analytics
curl -X GET http://localhost:5000/api/admin/analytics/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Common Issues

### PostgreSQL Connection Error

-  Ensure PostgreSQL is running: `pg_ctl status`
-  Check DATABASE_URL in .env file
-  Verify database exists: `psql -l`

### Redis Connection Error

-  Ensure Redis is running: `redis-cli ping` (should return "PONG")
-  Check REDIS_URL in .env file

### Import Errors

-  Ensure virtual environment is activated
-  Reinstall dependencies: `pip install -r requirements.txt`

### Port Already in Use

-  Change port in app.py or kill process using port 5000:

   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```

## Next Steps

1. Change admin password in production
2. Set up proper SECRET_KEY and JWT_SECRET_KEY
3. Configure CORS origins for your frontend
4. Set up proper file storage for production
5. Configure proper session management
6. Add rate limiting
7. Set up logging
8. Configure SSL/HTTPS for production

## API Documentation

See README.md for complete API documentation and endpoint details.

## Development Tips

-  Use Postman or similar tool to test API endpoints
-  Check server logs for debugging
-  Use PostgreSQL GUI tool like pgAdmin for database inspection
-  Use Redis GUI tool like RedisInsight for cache inspection
