# PayPal Sandbox Integration Guide

## Setup Instructions

### 1. Create PayPal Sandbox Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in or create a free developer account
3. Click on "Apps & Credentials"
4. Make sure you're on the "Sandbox" tab
5. Click "Create App"
6. Enter an app name (e.g., "Marketplace App")
7. Click "Create App"

### 2. Get Your Credentials

After creating the app, you'll see:

-  **Client ID** - Copy this value
-  **Secret** - Click "Show" and copy this value

### 3. Configure Server

1. Navigate to the `server` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and update:
   ```
   PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=<your-client-id>
   PAYPAL_CLIENT_SECRET=<your-secret>
   CLIENT_URL=http://localhost:3000
   ```

### 4. Configure Client

1. Navigate to the `client` directory
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Edit `.env.local` and update:
   ```
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=<your-client-id>
   ```

### 5. Install Dependencies

**Server:**

```bash
cd server
pip install -r requirements.txt
```

**Client:**

```bash
cd client
npm install
```

### 6. Start the Application

**Server:**

```bash
cd server
python app.py
```

**Client:**

```bash
cd client
npm run dev
```

### 7. Test with Sandbox Accounts

PayPal provides test accounts for sandbox testing:

1. Go to [Sandbox Accounts](https://developer.paypal.com/dashboard/accounts)
2. You'll see pre-created Personal and Business accounts
3. Click on an account to view credentials
4. Use these credentials to log in during checkout

**Example Test Credentials:**

-  Email: Usually ends with `@personal.example.com` or `@business.example.com`
-  Password: Usually displayed or can be reset

### 8. Testing the Payment Flow

1. Add items to cart
2. Proceed to checkout
3. Fill in shipping information
4. Select "PayPal" as payment method
5. Click the PayPal button
6. Log in with sandbox account credentials
7. Complete the payment
8. You'll be redirected back to the order confirmation

### API Endpoints

**Create PayPal Order:**

-  `POST /api/payments/paypal/create-order`
-  Requires: JWT token, order data
-  Returns: PayPal payment ID

**Capture PayPal Payment:**

-  `POST /api/payments/paypal/capture-order`
-  Requires: JWT token, payment_id, payer_id, order_data
-  Returns: Created order details

### Switching to Production

When ready for production:

1. Create a live app in PayPal Developer Dashboard (Live tab)
2. Update server `.env`:
   ```
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=<live-client-id>
   PAYPAL_CLIENT_SECRET=<live-secret>
   ```
3. Update client `.env.local`:
   ```
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=<live-client-id>
   ```

### Troubleshooting

**PayPal button not showing:**

-  Check that `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set correctly
-  Check browser console for errors
-  Verify PayPalProvider is wrapping the app in layout.tsx

**Payment creation fails:**

-  Verify server PayPal credentials are correct
-  Check server logs for detailed error messages
-  Ensure amounts are properly formatted (2 decimal places)

**Order not saving to database:**

-  Check database connection
-  Verify JWT token is valid
-  Check server logs for SQL errors

### Features Implemented

✅ PayPal Sandbox integration
✅ Alternative card payment (simulated)
✅ Shipping information collection
✅ Tax calculation
✅ Order creation in database with payment status
✅ Order confirmation and redirect
✅ Error handling and user feedback

### Security Notes

-  Never commit `.env` or `.env.local` files to version control
-  Keep your PayPal Secret secure
-  Use environment variables for all sensitive data
-  PayPal client ID is safe to expose in frontend (it's public)
-  PayPal Secret should ONLY be on the server

### Resources

-  [PayPal REST API Documentation](https://developer.paypal.com/api/rest/)
-  [PayPal React SDK Documentation](https://paypal.github.io/react-paypal-js/)
-  [PayPal Sandbox Testing Guide](https://developer.paypal.com/api/rest/sandbox/)
