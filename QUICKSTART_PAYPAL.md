# Quick Start: PayPal Integration

## Installation Commands

### 1. Install Server Dependencies

```bash
cd server
pip install -r requirements.txt
```

This will install:

-  paypalrestsdk==1.13.1 (new)
-  All existing dependencies

### 2. Install Client Dependencies

```bash
cd client
npm install
```

This will install:

-  @paypal/react-paypal-js@^8.7.0 (new)
-  All existing dependencies

### 3. Configure Environment Variables

**Server (.env):**

```bash
cd server
cp .env.example .env
```

Edit `.env` and add your PayPal credentials:

```env
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=<get-from-paypal-dashboard>
PAYPAL_CLIENT_SECRET=<get-from-paypal-dashboard>
CLIENT_URL=http://localhost:3000
```

**Client (.env.local):**

```bash
cd client
cp .env.local.example .env.local
```

Edit `.env.local` and add:

```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<same-as-server-client-id>
```

### 4. Get PayPal Sandbox Credentials

1. Visit: https://developer.paypal.com/dashboard/
2. Login or create a developer account
3. Go to "Apps & Credentials" → "Sandbox" tab
4. Click "Create App"
5. Name it (e.g., "Marketplace App")
6. Copy the **Client ID** and **Secret**

### 5. Start the Application

**Terminal 1 (Server):**

```bash
cd server
python app.py
```

**Terminal 2 (Client):**

```bash
cd client
npm run dev
```

### 6. Test Payment Flow

1. Open http://localhost:3000
2. Add products to cart
3. Go to checkout
4. Fill in shipping information
5. Select "PayPal" as payment method
6. Click PayPal button
7. Login with sandbox account (from PayPal dashboard)
8. Complete payment
9. Verify order is created

---

## Sandbox Test Accounts

PayPal automatically creates test accounts for you:

1. Go to: https://developer.paypal.com/dashboard/accounts
2. View the "Personal" account credentials
3. Use these to login during checkout testing

Example:

-  Email: `sb-xxxxx@personal.example.com`
-  Password: Click to view/reset

---

## Troubleshooting

**Issue: PayPal button not showing**

-  Check `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set in client `.env.local`
-  Check browser console for errors
-  Verify npm install completed successfully

**Issue: "Payment creation failed"**

-  Check server PayPal credentials in `.env`
-  Verify `PAYPAL_MODE=sandbox`
-  Check server terminal for detailed errors

**Issue: Import errors**

-  Run `pip install -r requirements.txt` in server directory
-  Run `npm install` in client directory
-  Restart both servers after installation

---

## What's New

### Server

-  `/api/payments/paypal/create-order` - Create PayPal payment
-  `/api/payments/paypal/capture-order` - Capture payment & create order
-  PayPal SDK configuration in app.py
-  Environment variables for PayPal in config.py

### Client

-  PayPal button integration in checkout
-  Payment method selection (PayPal or Card)
-  PayPal provider wrapping the app
-  Environment variable for PayPal client ID

---

For detailed documentation, see:

-  **PAYPAL_SETUP.md** - Comprehensive setup guide
-  **PAYPAL_IMPLEMENTATION.md** - Technical implementation details
