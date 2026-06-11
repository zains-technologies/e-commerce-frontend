# Reusable Ecommerce Frontend

Next.js storefront MVP for the reusable Laravel ecommerce backend.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Fetch API service layer
- Mobile-first responsive ecommerce UI

## Setup

```bash
cd C:\mintbox\e-commerce\e-commerce-frontend
npm install
copy .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

Important: run `npm run dev`, not `next dev`. The `next` binary is installed locally inside the project.

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=https://e-commerce-backend-main-d3ytue.laravel.cloud/api
```

You can also use:

```env
NEXT_PUBLIC_API_BASE_URL=https://e-commerce-backend-main-d3ytue.laravel.cloud/api/v1
```

The backend currently supports both `/api` and `/api/v1`.

## Pages

- `/` homepage
- `/products` product listing with search, category chips, sort, and price UI
- `/product/[slug]` product detail
- `/cart` cart items, totals, quantity update, remove
- `/checkout` customer details, address, payment method, order summary
- `/login`
- `/register`

## Architecture

API URLs:

```text
src/constants/apiRoutes.ts
```

API calls:

```text
src/services
```

Reusable data logic:

```text
src/hooks
```

Shared interfaces:

```text
src/types
```

Reusable UI:

```text
src/components
```

## Sample Product Response

```json
{
  "id": 1,
  "name": "Essential T-Shirt",
  "slug": "essential-t-shirt",
  "description": "Soft cotton daily t-shirt.",
  "price": 2500,
  "sku": "TSHIRT-001",
  "stock_quantity": 50,
  "is_featured": true,
  "images": [
    {
      "id": 1,
      "url": "https://...",
      "is_primary": true
    }
  ],
  "variants": [
    {
      "id": 1,
      "attribute_name": "size",
      "attribute_value": "M",
      "price_adjustment": 0,
      "stock_quantity": 20
    }
  ]
}
```

## Demo Backend

Laravel Cloud API:

```text
https://e-commerce-backend-main-d3ytue.laravel.cloud/api
```

Demo login:

```text
admin@example.com / password
```

