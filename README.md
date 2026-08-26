# Kakinada Online Store

A mobile-first React + Vite PWA for a local Kakinada store.

## Current architecture

- React + Vite
- Tailwind CSS v4
- PWA with install/offline shell
- Firebase Auth for admin/customer authentication when enabled
- Firestore for products, orders and store data
- Cloudinary for product images/videos (Firebase Storage is intentionally not used)
- Guest shopping cart stored locally
- Checkout modes:
  - Cash on Delivery
  - Shop Pickup
- No online payment gateway in the first version

## Important security model

Customers can browse without signing in. Admin access must be protected by Firebase Authentication plus an admin role/claim or an allow-listed admin UID. Never put Firebase Admin SDK credentials in this frontend repository.

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add Firebase Web App values.
5. Add Cloudinary cloud name and unsigned upload preset if media uploads are needed.
6. Run `npm run dev`.
7. Build with `npm run build`.

## Firebase collections

Recommended Firestore collections:

- `products`
- `categories`
- `orders`
- `admins`
- `settings`

The starter currently uses mock products so the UI can be developed before Firebase is connected.

## Order model

An order should contain:

- customer name
- mobile
- address (delivery only)
- fulfillment: `delivery` or `pickup`
- payment: `cod` or `pay_at_store`
- items
- subtotal
- deliveryFee
- total
- status
- createdAt

## Next production steps

1. Create Firebase project.
2. Enable Firestore.
3. Enable Authentication only for admin initially.
4. Add admin authorization.
5. Add Firestore security rules.
6. Create Cloudinary unsigned upload preset.
7. Replace mock product service with Firestore.
8. Add real order management in the admin dashboard.
9. Add WhatsApp/order notification only after the core flow is stable.
