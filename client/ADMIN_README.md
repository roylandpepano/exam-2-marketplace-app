# Admin Panel Frontend

Complete Next.js-based admin panel for the marketplace application with shadcn/ui components.

## 🚀 Features

-  **Dashboard**: Overview with key metrics and analytics
-  **Product Management**: Full CRUD operations with image upload
-  **Category Management**: Create, edit, and delete categories
-  **Order Management**: View and update order statuses
-  **User Management**: View users and manage admin privileges
-  **Analytics**: Detailed insights and performance metrics
-  **Responsive Design**: Works on all device sizes
-  **Modern UI**: Built with shadcn/ui components

## 📦 Tech Stack

-  **Framework**: Next.js 16.0.8 (App Router)
-  **UI**: shadcn/ui + Tailwind CSS 4
-  **Icons**: Lucide React
-  **Notifications**: Sonner (toast)
-  **Authentication**: JWT with auto-refresh
-  **TypeScript**: Full type safety

## 🛠️ Setup

1. **Install Dependencies**:

```bash
cd client
npm install
```

2. **Environment Configuration**:
   Create `.env.local` file (already created):

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Start Development Server**:

```bash
npm run dev
```

4. **Access Admin Panel**:

-  Login: http://localhost:3000/login
-  Admin: http://localhost:3000/admin
-  Default credentials: `admin@example.com` / `admin123`

## 📁 Project Structure

```
client/
├── app/
│   ├── admin/                    # Admin pages
│   │   ├── page.tsx             # Dashboard
│   │   ├── products/            # Product management
│   │   ├── categories/          # Category management
│   │   ├── orders/              # Order management
│   │   ├── users/               # User management
│   │   └── analytics/           # Analytics
│   └── login/                   # Login page
├── components/
│   ├── AdminLayout.tsx          # Sidebar layout
│   └── ui/                      # shadcn components
├── hooks/
│   └── use-auth.ts              # Authentication hook
└── lib/
    └── api.ts                   # API client
```

## 🔐 Authentication

The admin panel uses JWT-based authentication with:

-  Automatic token refresh
-  Protected routes
-  Admin role verification
-  Session persistence

### Using the Auth Hook

```tsx
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
   const { user, login, logout, loading } = useAuth();

   // Check if user is admin
   if (user?.is_admin) {
      // Admin features
   }
}
```

## 🎨 Admin Layout

All admin pages use the `AdminLayout` component with:

-  Collapsible sidebar navigation
-  User profile display
-  Logout functionality
-  Responsive mobile drawer

```tsx
import AdminLayout from "@/components/AdminLayout";

export default function MyAdminPage() {
   return (
      <AdminLayout>
         <h1>My Admin Content</h1>
      </AdminLayout>
   );
}
```

## 📊 Pages Overview

### Dashboard (`/admin`)

-  Total products, categories, orders, users
-  Recent orders list
-  Quick stats cards
-  Revenue summary

### Products (`/admin/products`)

-  Sortable product table
-  Search and filter
-  Bulk actions (delete, export)
-  Create/Edit with image upload
-  Stock level indicators

### Categories (`/admin/categories`)

-  Category list with stats
-  Quick add dialog
-  Edit/Delete actions
-  Product count per category

### Orders (`/admin/orders`)

-  Order list with filters
-  Status management
-  Order details view
-  Customer information
-  Payment tracking

### Users (`/admin/users`)

-  User list with search
-  Admin role toggle
-  User statistics
-  Registration dates

### Analytics (`/admin/analytics`)

-  Sales performance
-  Top selling products
-  Low stock alerts
-  Customer insights

## 🔌 API Integration

The `api.ts` library handles all backend communication:

```typescript
import { api } from "@/lib/api";

// Products
const products = await api.getProducts({ page: 1, limit: 10 });
const product = await api.getProduct(id);
await api.createProduct(formData);
await api.updateProduct(id, data);
await api.deleteProduct(id);

// Categories
const categories = await api.getCategories();
await api.createCategory(data);
await api.updateCategory(id, data);

// Orders
const orders = await api.getOrders({ status: "pending" });
await api.updateOrderStatus(id, "shipped");

// Users
const users = await api.getUsers();
await api.toggleAdmin(userId);

// Analytics
const stats = await api.getAnalytics();
```

## 🎯 Key Features

### Image Upload

Products support multiple image uploads with:

-  Client-side preview
-  Drag & drop
-  Format validation
-  Automatic optimization (backend)

### Pagination

Tables include pagination with:

-  Configurable page size
-  Total count display
-  Page navigation
-  URL state persistence

### Toast Notifications

All actions show feedback:

```tsx
import { toast } from "sonner";

toast.success("Product created!");
toast.error("Failed to delete");
```

### Search & Filters

Advanced filtering on:

-  Products (name, category, stock)
-  Orders (status, customer)
-  Users (email, role)

## 🚦 Protected Routes

All `/admin/*` routes are protected and require:

1. Valid authentication token
2. Admin role (`is_admin: true`)

Unauthorized users are redirected to `/login`.

## 📱 Responsive Design

The admin panel is fully responsive:

-  **Desktop**: Sidebar navigation
-  **Tablet**: Collapsible sidebar
-  **Mobile**: Drawer menu

## 🔧 Development

### Adding a New Admin Page

1. Create page file:

```tsx
// app/admin/my-feature/page.tsx
import AdminLayout from "@/components/AdminLayout";

export default function MyFeaturePage() {
   return (
      <AdminLayout>
         <h1>My Feature</h1>
      </AdminLayout>
   );
}
```

2. Add to navigation (in `AdminLayout.tsx`):

```tsx
{
  title: "My Feature",
  url: "/admin/my-feature",
  icon: MyIcon,
}
```

### Adding API Methods

1. Add method to `api.ts`:

```typescript
async myMethod(params: any) {
  return this.request('/my-endpoint', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
```

## 🐛 Troubleshooting

### Authentication Issues

-  Clear browser storage: `localStorage.clear()`
-  Check backend is running on port 5000
-  Verify token in Network tab

### API Errors

-  Check `NEXT_PUBLIC_API_URL` in `.env.local`
-  Ensure backend CORS is configured
-  Check browser console for errors

### Build Errors

-  Run `npm install` to update dependencies
-  Clear `.next` folder: `rm -rf .next`
-  Check Node.js version (18+)

## 📝 Environment Variables

| Variable              | Description     | Default                     |
| --------------------- | --------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 🔗 Related Documentation

-  [Backend API Documentation](../server/README.md)
-  [shadcn/ui Documentation](https://ui.shadcn.com)
-  [Next.js Documentation](https://nextjs.org/docs)

## 📄 License

MIT
