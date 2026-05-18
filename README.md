# ShopFlow API

A fully-featured RESTful mock API for an e-commerce platform, powered by [json-server](https://github.com/typicode/json-server). Designed to simulate real-world API behaviour — ideal for frontend development, integration testing, and portfolio demonstration.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Reference](#api-reference)
  - [Users](#users)
  - [Categories](#categories)
  - [Products](#products)
  - [Orders](#orders)
  - [Reviews](#reviews)
  - [Carts](#carts)
  - [Coupons](#coupons)
- [Filtering, Sorting & Pagination](#filtering-sorting--pagination)
- [HTTP Status Codes](#http-status-codes)
- [Example Requests](#example-requests)

---

## Overview

ShopFlow API provides a complete set of REST endpoints for an e-commerce system. It covers the full lifecycle of an online store: browsing products by category, placing orders, managing cart items, leaving reviews, and applying discount coupons.

**Base URL:** `http://localhost:3000/api`

All responses are in `application/json`.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [json-server](https://github.com/typicode/json-server) | Zero-code REST API from a JSON file |
| Node.js | Runtime environment |
| npm | Package management |

---

## Getting Started

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/qa-eden/shopflow-api.git
cd shopflow-api

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

The API will be live at **http://localhost:3000/api**

### Development mode (with simulated network delay)

```bash
json-server SHopFlowAPI.json
```
---

## Project Structure

```
shopflow-api/
├── ShopFlowAPI.json          # All data (the "database")
├── ShopFlow API Documentation.html     # Project Static Documentation
└── README.md        # This documentation
```

---

## Data Models

### User

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `name` | string | Full name |
| `email` | string | Email address (unique) |
| `phone` | string | Contact number |
| `role` | string | `customer` or `admin` |
| `createdAt` | ISO 8601 | Account creation timestamp |
| `address` | object | `street`, `city`, `state`, `country`, `postalCode` |

### Category

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `name` | string | Category label |
| `slug` | string | URL-friendly name |
| `description` | string | Short description |

### Product

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `name` | string | Product name |
| `slug` | string | URL-friendly name |
| `description` | string | Full description |
| `price` | float | Selling price (USD) |
| `comparePrice` | float or null | Original price (for discounts) |
| `sku` | string | Stock-keeping unit |
| `categoryId` | integer | Foreign key → Category |
| `stock` | integer | Units available |
| `rating` | float | Average rating (1–5) |
| `reviewCount` | integer | Total number of reviews |
| `images` | array | Array of image URLs |
| `tags` | array | Searchable tags |
| `status` | string | `active` or `out_of_stock` |
| `createdAt` | ISO 8601 | Date added |

### Order

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `orderNumber` | string | Human-readable ref (e.g. `SF-2024-0001`) |
| `userId` | integer | Foreign key → User |
| `status` | string | `pending`, `processing`, `shipped`, `delivered`, `cancelled` |
| `paymentStatus` | string | `paid`, `pending`, `failed` |
| `paymentMethod` | string | `card`, `bank_transfer`, `wallet` |
| `subtotal` | float | Items total |
| `tax` | float | Tax amount |
| `shippingFee` | float | Delivery cost |
| `total` | float | Grand total |
| `currency` | string | ISO 4217 code (e.g. `USD`) |
| `shippingAddress` | object | Delivery address snapshot |
| `items` | array | Line items with `productId`, `quantity`, `unitPrice`, `subtotal` |
| `notes` | string | Optional delivery notes |
| `createdAt` | ISO 8601 | Order placement time |
| `updatedAt` | ISO 8601 | Last status update time |

### Review

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `productId` | integer | Foreign key → Product |
| `userId` | integer | Foreign key → User |
| `rating` | integer | 1 to 5 |
| `title` | string | Review headline |
| `body` | string | Full review text |
| `verified` | boolean | Whether it's a verified purchase |
| `createdAt` | ISO 8601 | Review date |

### Cart

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `userId` | integer | Foreign key → User |
| `items` | array | `{ productId, quantity }` pairs |
| `updatedAt` | ISO 8601 | Last modification time |

### Coupon

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `code` | string | Discount code |
| `type` | string | `percentage` or `fixed` |
| `value` | float | Discount amount or percent |
| `minOrderAmount` | float | Minimum qualifying order |
| `maxUses` | integer | Total use cap |
| `usedCount` | integer | Times used so far |
| `expiresAt` | ISO 8601 | Expiry timestamp |
| `active` | boolean | Whether it is currently valid |

---

## API Reference

### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get a single user |
| `POST` | `/api/users` | Create a new user |
| `PUT` | `/api/users/:id` | Replace a user record |
| `PATCH` | `/api/users/:id` | Partially update a user |
| `DELETE` | `/api/users/:id` | Delete a user |

---

### Categories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | List all categories |
| `GET` | `/api/categories/:id` | Get a single category |
| `POST` | `/api/categories` | Create a category |
| `PUT` | `/api/categories/:id` | Replace a category |
| `PATCH` | `/api/categories/:id` | Partially update a category |
| `DELETE` | `/api/categories/:id` | Delete a category |

---

### Products

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Get a single product |
| `GET` | `/api/v1/products/category/:categoryId` | Products by category |
| `GET` | `/api/v1/products/status/:status` | Products by status (`active`, `out_of_stock`) |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/:id` | Replace a product |
| `PATCH` | `/api/products/:id` | Partially update a product |
| `DELETE` | `/api/products/:id` | Delete a product |

---

### Orders

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/:id` | Get a single order |
| `GET` | `/api/v1/orders/user/:userId` | Orders belonging to a user |
| `GET` | `/api/v1/orders/status/:status` | Orders filtered by status |
| `POST` | `/api/orders` | Create an order |
| `PUT` | `/api/orders/:id` | Replace an order |
| `PATCH` | `/api/orders/:id` | Partially update (e.g. update status) |
| `DELETE` | `/api/orders/:id` | Delete an order |

---

### Reviews

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reviews` | List all reviews |
| `GET` | `/api/reviews/:id` | Get a single review |
| `GET` | `/api/v1/reviews/product/:productId` | Reviews for a product |
| `GET` | `/api/v1/reviews/user/:userId` | Reviews written by a user |
| `POST` | `/api/reviews` | Submit a review |
| `PUT` | `/api/reviews/:id` | Replace a review |
| `PATCH` | `/api/reviews/:id` | Partially update a review |
| `DELETE` | `/api/reviews/:id` | Delete a review |

---

### Carts

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/carts` | List all carts |
| `GET` | `/api/carts/:id` | Get a single cart |
| `GET` | `/api/v1/carts/user/:userId` | Cart for a specific user |
| `POST` | `/api/carts` | Create a cart |
| `PUT` | `/api/carts/:id` | Replace a cart |
| `PATCH` | `/api/carts/:id` | Update cart items |
| `DELETE` | `/api/carts/:id` | Clear/delete a cart |

---

### Coupons

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/coupons` | List all coupons |
| `GET` | `/api/coupons/:id` | Get a single coupon |
| `POST` | `/api/coupons` | Create a coupon |
| `PUT` | `/api/coupons/:id` | Replace a coupon |
| `PATCH` | `/api/coupons/:id` | Partially update a coupon |
| `DELETE` | `/api/coupons/:id` | Delete a coupon |

---

## Filtering, Sorting & Pagination

json-server supports advanced query parameters out of the box.

### Filter by field value

```
GET /api/products?categoryId=1
GET /api/products?status=active
GET /api/users?role=customer
GET /api/orders?paymentStatus=paid
```

### Full-text search

```
GET /api/products?q=headphones
```

### Sort results

```
GET /api/products?_sort=price&_order=asc
GET /api/products?_sort=rating&_order=desc
GET /api/orders?_sort=createdAt&_order=desc
```

### Pagination

```
GET /api/products?_page=1&_limit=10
GET /api/orders?_page=2&_limit=5
```

Response includes `X-Total-Count` header for total records.

### Embed related resources

```
GET /api/orders?_embed=users
GET /api/products?_expand=category
```

### Range / slice

```
GET /api/products?_start=0&_end=5
```

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Successful GET, PUT, PATCH |
| `201 Created` | Successful POST |
| `204 No Content` | Successful DELETE |
| `400 Bad Request` | Malformed request body |
| `404 Not Found` | Resource does not exist |

---

## Example Requests

### Create a new order

```http
POST /api/orders
Content-Type: application/json

{
  "userId": 1,
  "status": "pending",
  "paymentStatus": "paid",
  "paymentMethod": "card",
  "subtotal": 149.99,
  "tax": 12.00,
  "shippingFee": 5.00,
  "total": 166.99,
  "currency": "USD",
  "shippingAddress": {
    "street": "12 Maple Street",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "100001"
  },
  "items": [
    {
      "productId": 1,
      "productName": "Wireless Headphones",
      "quantity": 1,
      "unitPrice": 149.99,
      "subtotal": 149.99
    }
  ],
  "notes": "",
  "createdAt": "2024-04-15T10:00:00Z",
  "updatedAt": "2024-04-15T10:00:00Z"
}
```

### Update an order status

```http
PATCH /api/orders/1
Content-Type: application/json

{
  "status": "shipped",
  "updatedAt": "2024-04-16T08:30:00Z"
}
```

### Add a product review

```http
POST /api/reviews
Content-Type: application/json

{
  "productId": 1,
  "userId": 2,
  "rating": 5,
  "title": "Incredible sound quality",
  "body": "Best purchase this year. Clear audio and excellent ANC.",
  "verified": true,
  "createdAt": "2024-04-15T12:00:00Z"
}
```

### Get paginated active products sorted by rating

```
GET /api/products?status=active&_sort=rating&_order=desc&_page=1&_limit=5
```

### Search products

```
GET /api/products?q=wireless
```

---

## Notes
- All `POST` requests auto-generate an incremented `id`.
- There is no built-in authentication — this is intentional for local development use.
- To reset data to the original seed, restore `ShopFlowAPI.json` from version control.

---

## License

MIT — free to use for personal and commercial projects.
