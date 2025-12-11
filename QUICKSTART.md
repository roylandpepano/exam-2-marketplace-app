# 🚀 Quick Start Guide - Marketplace Admin Panel

Complete setup guide to get your marketplace admin panel running in minutes.

## Prerequisites

-  **Python 3.8+** (for backend)
-  **Node.js 18+** (for frontend)
-  **PostgreSQL** (database)
-  **Redis** (caching - optional for development)

## 🔧 Backend Setup (Flask API)

### 1. Navigate to Server Directory

```bash
cd server
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Create `.env` file in `server/` directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/marketplace_db

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# JWT Secret
JWT_SECRET_KEY=your-super-secret-key-change-this-in-production

# Upload Directory
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# Flask
FLASK_APP=app.py
FLASK_ENV=development
```

### 5. Setup Database

```bash
# Create database
python init_db.py
```

This will:

-  Create all tables
-  Add default admin user: `admin@example.com` / `admin123`
-  Set up relationships

### 6. Start Backend Server

```bash
python app.py
```

Backend runs at: **http://localhost:5000**

API endpoints:

-  Auth: `http://localhost:5000/api/auth/*`
-  Admin: `http://localhost:5000/api/admin/*`

## 🎨 Frontend Setup (Next.js Admin Panel)

### 1. Navigate to Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

The `.env.local` file is already created with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Start Development Server

```bash
npm run dev
```

Frontend runs at: **http://localhost:3000**

## 🔐 Access Admin Panel

1. **Open Browser**: Navigate to http://localhost:3000/login

2. **Login with Default Credentials**:

   -  Email: `admin@example.com`
   -  Password: `admin123`

3. **You'll be redirected to**: http://localhost:3000/admin

## 📊 Admin Features Available

Once logged in, you can:

✅ **Dashboard** (`/admin`)

-  View total products, categories, orders, users
-  See recent orders
-  Monitor key metrics

✅ **Products** (`/admin/products`)

-  Add new products with images
-  Edit existing products
-  Delete products
-  Manage inventory
-  Bulk operations

✅ **Categories** (`/admin/categories`)

-  Create categories
-  Edit category names
-  Delete categories
-  View product counts

✅ **Orders** (`/admin/orders`)

-  View all orders
-  Update order status (pending → processing → shipped → delivered)
-  View customer details
-  Track payments

✅ **Users** (`/admin/users`)

-  View all registered users
-  Toggle admin privileges
-  See registration dates

✅ **Analytics** (`/admin/analytics`)

-  Sales performance
-  Top selling products
-  Low stock alerts
-  Revenue tracking

## 🧪 Testing the API

### Using cURL

**Login**:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

**Get Products** (with auth token):

```bash
curl http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Python

```python
import requests

# Login
response = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'admin@example.com',
    'password': 'admin123'
})
token = response.json()['access_token']

# Get products
products = requests.get(
    'http://localhost:5000/api/admin/products',
    headers={'Authorization': f'Bearer {token}'}
).json()
```

## 📁 Project Structure

```
exam-2-marketplace-app/
├── server/                    # Flask Backend
│   ├── app.py                # Main application
│   ├── models/               # Database models
│   ├── routes/               # API endpoints
│   ├── utils/                # Helpers & auth
│   └── uploads/              # Product images
│
├── client/                   # Next.js Frontend
│   ├── app/
│   │   ├── admin/           # Admin pages
│   │   └── login/           # Login page
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   └── lib/                 # API client
│
└── QUICKSTART.md            # This file
```

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error**:

```bash
# Make sure PostgreSQL is running
# Check DATABASE_URL in .env
# Verify database exists
```

**Module Not Found**:

```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**Port Already in Use**:

```bash
# Change port in app.py
app.run(port=5001)  # Use different port
```

### Frontend Issues

**Cannot Connect to API**:

-  Verify backend is running on port 5000
-  Check `NEXT_PUBLIC_API_URL` in `.env.local`
-  Check browser console for CORS errors

**Build Errors**:

```bash
# Clear cache and rebuild
rm -rf .next
npm install
npm run dev
```

**Authentication Not Working**:

```bash
# Clear browser storage
localStorage.clear()
# Try logging in again
```

## 🔗 API Documentation

Full API documentation available in `server/README.md`

Key endpoints:

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| POST   | `/api/auth/login`              | User login          |
| POST   | `/api/auth/refresh`            | Refresh token       |
| GET    | `/api/admin/products`          | List products       |
| POST   | `/api/admin/products`          | Create product      |
| PUT    | `/api/admin/products/:id`      | Update product      |
| DELETE | `/api/admin/products/:id`      | Delete product      |
| GET    | `/api/admin/categories`        | List categories     |
| GET    | `/api/admin/orders`            | List orders         |
| PUT    | `/api/admin/orders/:id/status` | Update order status |
| GET    | `/api/admin/users`             | List users          |
| GET    | `/api/admin/analytics`         | Get analytics       |

## 📝 Next Steps

1. **Change Default Password**:

   -  Login and update admin credentials
   -  Update `.env` JWT secret

2. **Add Sample Data**:

   -  Create categories
   -  Add products with images
   -  Test order flow

3. **Configure Production**:

   -  Set proper `DATABASE_URL`
   -  Use secure `JWT_SECRET_KEY`
   -  Configure CORS for production domain
   -  Set up Redis for caching

4. **Deploy**:
   -  Backend: Deploy Flask to Heroku/Railway/DigitalOcean
   -  Frontend: Deploy Next.js to Vercel/Netlify
   -  Database: Use managed PostgreSQL (AWS RDS, Supabase)

## 💡 Tips

-  **Redis**: Optional for development, recommended for production
-  **Images**: Stored in `server/uploads/` directory
-  **CORS**: Configured to allow localhost:3000 by default
-  **Auto-login**: Tokens stored in localStorage
-  **Token Refresh**: Automatic when access token expires

## 🆘 Need Help?

-  Check `server/README.md` for backend details
-  Check `client/ADMIN_README.md` for frontend details
-  Review API responses in browser DevTools
-  Check server logs for error details

## 📄 License

MIT

---

**Happy Coding! 🎉**
