# Crear llave publica y private RSA 2048

## Comando para crear llave privada RSA 2048
```bash
    openssl genrsa -out private.pem 2048
```

## Comando para crear llave publica RSA 2048
```bash
    openssl rsa -in private.pem -pubout -out public.pem
```

# API Documentation

Authentication

1) Register
- URL: POST /api/auth/register
- Headers: Content-Type: application/json
- Body:
  {
    "username": "string",
    "password": "string"
  }
- Responses:
  - 201 Created
    {
      "id": number,
      "username": "string",
      "token": "jwt-token"
    }
  - 400 Bad Request — missing username or password
  - 409 Conflict — username already exists
- JWT: no

2) Login
- URL: POST /api/auth/login
- Headers: Content-Type: application/json
- Body:
  {
    "username": "string",
    "password": "string"
  }
- Responses:
  - 200 OK
    {
      "token": "jwt-token"
    }
  - 400 Bad Request — missing fields
  - 401 Unauthorized — invalid credentials
- JWT: no


Health

- URL: GET /api/health/ping
- Headers: none
- Body: none
- Response: 200 OK
  {
    "status": "ok"
  }
- JWT: no

Protected endpoints: all below require Authorization: Bearer \<token>

Products

- GET /api/products
  - Headers: Authorization: Bearer \<token>
  - Body: none
  - Response: 200 OK — array of product objects
    Product shape:
    {
      "id": number,
      "store_id": number,
      "name": "string",
      "description": "string",
      "category_id": number
    }
  - JWT: yes

- POST /api/products
  - Headers: Authorization: Bearer \<token>, Content-Type: application/json
  - Body:
    {
      "store_id": number,
      "name": "string",
      "description": "string",
      "category_id": number
    }
  - Responses:
    - 201 Created — returns created product object
    - 500 Internal Server Error — DB or validation errors
  - JWT: yes

- GET /api/products/:id
  - Headers: Authorization: Bearer \<token>
  - Response: 200 OK product or 404 Not Found
  - JWT: yes

- PUT /api/products/:id
  - Headers: Authorization: Bearer \<token>, Content-Type: application/json
  - Body: any updatable fields (store_id, name, description, category_id)
  - Response: 200 OK updated product or 404 Not Found
  - JWT: yes

- DELETE /api/products/:id
  - Headers: Authorization: Bearer \<token>
  - Response: 204 No Content or 404 Not Found
  - JWT: yes

Categories

- GET /api/categories
  - Headers: Authorization: Bearer \<token>
  - Response: 200 OK — array of category objects { id, name, store_id }
  - JWT: yes

- POST /api/categories
  - Headers: Authorization: Bearer \<token>, Content-Type: application/json
  - Body:
    {
      "name": "string",
      "store_id": number
    }
  - Response: 201 Created — created category
  - JWT: yes

- GET /api/categories/:id
  - Headers: Authorization: Bearer \<token>
  - Response: 200 OK category or 404 Not Found
  - JWT: yes

- PUT /api/categories/:id
  - Headers: Authorization: Bearer <token>, Content-Type: application/json
  - Body: fields to update
  - Response: 200 OK updated category or 404 Not Found
  - JWT: yes

- DELETE /api/categories/:id
  - Headers: Authorization: Bearer <token>
  - Response: 204 No Content or 404 Not Found
  - JWT: yes

Stores

- GET /api/stores
  - Headers: Authorization: Bearer <token>
  - Response: 200 OK — array of stores { id, name, address }
  - JWT: yes

- POST /api/stores
  - Headers: Authorization: Bearer <token>, Content-Type: application/json
  - Body:
    {
      "name": "string",
      "address": "string"
    }
  - Response: 201 Created — created store object
  - JWT: yes

- GET /api/stores/:id
  - Headers: Authorization: Bearer <token>
  - Response: 200 OK store or 404 Not Found
  - JWT: yes

- PUT /api/stores/:id
  - Headers: Authorization: Bearer <token>, Content-Type: application/json
  - Body: fields to update (name, address)
  - Response: 200 OK updated store or 404 Not Found
  - JWT: yes

- DELETE /api/stores/:id
  - Headers: Authorization: Bearer <token>
  - Response: 204 No Content or 404 Not Found
  - JWT: yes
