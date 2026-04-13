# API Gateway

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![gRPC](https://img.shields.io/badge/gRPC-244C5A?style=flat&logo=google&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat&logo=rabbitmq&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat&logo=swagger&logoColor=black)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat&logo=prometheus&logoColor=white)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-7B61FF?style=flat&logo=opentelemetry&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat&logo=prettier&logoColor=black)

Central entry point for microservices ecosystem. This service handles authentication, authorization, request routing, and provides observability features for all downstream microservices.

## Technology Stack

- **Framework**: NestJS v11
- **Language**: TypeScript 5.7
- **Runtime**: Node.js 24
- **RPC Protocol**: gRPC (for microservice communication)
- **Message Queue**: RabbitMQ (for async notifications)
- **Authentication**: JWT with Passport.js
- **Observability**: Prometheus metrics + OpenTelemetry/Jaeger tracing
- **API Documentation**: Swagger/OpenAPI

## Project Structure

```
api-gateway/
├── src/
│   ├── auth/                    # Authentication module (signup, signin, tokens)
│   ├── user/                    # User profile & admin management
│   ├── menu-category/           # Menu category CRUD operations
│   ├── menu-item/               # Menu item management
│   ├── store-category/          # Store category management
│   ├── store-attribute/         # Store attribute management
│   ├── store-item/              # Store item management (products)
│   ├── media/                   # File upload (avatars)
│   ├── health-check/            # Microservices health monitoring
│   ├── supervision/
│   │   ├── metrics/             # Prometheus metrics collection
│   │   └── tracing/             # OpenTelemetry/Jaeger tracing
│   ├── transport/
│   │   └── message-broker/      # RabbitMQ integration
│   ├── common/                  # Shared DTOs and enums
│   ├── configs/                 # gRPC client configuration
│   ├── utils/                   # Interceptors, filters, helpers
│   └── generated-types/         # Auto-generated protobuf types
├── proto/                       # Protocol buffer definitions
├── test/                        # E2E tests
├── Dockerfile
└── docker-compose.yml
```

## Connected Microservices

| Service | Protocol | Purpose |
|---------|----------|---------|
| User Microservice | gRPC | Authentication, user management |
| Menu Microservice | gRPC | Menu categories and items |
| Media Microservice | gRPC | File storage operations |
| Store Microservice | gRPC | Store categories, attributes, and items |
| Notification Microservice | RabbitMQ | Email notifications |

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server
NODE_ENV=development
HTTP_PORT=4004

# gRPC Microservices
MENU_MICROSERVICE_GRPC_URL=0.0.0.0:5001
USER_MICROSERVICE_GRPC_URL=0.0.0.0:5002
MEDIA_MICROSERVICE_GRPC_URL=0.0.0.0:5003
STORE_MICROSERVICE_GRPC_URL=0.0.0.0:5004

# Cookie Configuration
COOKIE_SECRET=your_cookie_secret_key_here
COOKIE_DOMAIN=your_domain
COOKIE_TTL=604800

# JWT
JWT_ACCESS_SECRET=your_jwt_access_secret_key

# RabbitMQ
RABBITMQ_URL=
RABBITMQ_QUEUE=
```

## Installation

```bash
npm install
```

## Running the Service

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## Docker

```bash
# Build image
docker build -t api-gateway .

# Run with docker-compose
docker-compose up
```

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Register new user |
| POST | `/auth/signin` | No | Login user |
| POST | `/auth/verify-email?token=` | No | Verify email address |
| POST | `/auth/resend-confirmation-email` | No | Resend verification email |
| POST | `/auth/refresh-tokens` | Cookie | Refresh JWT tokens |
| POST | `/auth/init-reset-password` | No | Initiate password reset |
| POST | `/auth/resend-reset-password-email` | No | Resend password reset email |
| POST | `/auth/set-new-password?token=` | No | Set new password |
| POST | `/auth/logout-current-device` | JWT | Clear refresh token | Sign out current session |
| POST | `/auth/logout-other-devices` | JWT | Sign out all other sessions |
| POST | `/auth/logout-all-devices` | JWT | Sign out all sessions |
| GET | `/auth/google` | No | Redirect to Google OAuth consent screen |
| GET | `/auth/google/callback` | No | Google OAuth callback (internal — handled by Passport) |
| GET | `/auth/exchange-code?code=` | No | Exchange one-time code for access token |

### User (`/user`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/me` | JWT | Get own profile |
| GET | `/user/:id` | JWT | Get user by ID |
| POST | `/user/update` | JWT | Update profile |
| DELETE | `/user/delete` | JWT | Delete account |
| POST | `/user/confirm-password` | JWT | Verify password |
| POST | `/user/change-password` | JWT | Change password |

### Admin (`/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | ADMIN | List all users (paginated) |
| GET | `/admin/user/:id` | ADMIN | Get user details |
| POST | `/admin/ban` | ADMIN | Ban user |
| POST | `/admin/unban` | ADMIN | Unban user |
| POST | `/admin/change-role/:id` | ADMIN | Change user role |
| GET | `/admin/banned-users` | ADMIN | List banned users |
| GET | `/admin/ban-details/:id` | ADMIN | Get ban info |

### Menu Category (`/menu-category`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/menu-category?language=` | ADMIN/MOD | Get categories by language (EN, UA, RU) |
| GET | `/menu-category/:id` | ADMIN/MOD | Get category details |
| POST | `/menu-category/create` | ADMIN/MOD | Create category |
| PATCH | `/menu-category/update/:id` | ADMIN/MOD | Update category |
| PATCH | `/menu-category/change-position/:id` | ADMIN/MOD | Reorder category |
| DELETE | `/menu-category/:id` | ADMIN/MOD | Delete category |

### Menu Item (`/menu-item`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/menu-item?categoryId=` | ADMIN/MOD | Get items by category |
| GET | `/menu-item/:id` | ADMIN/MOD | Get item details |
| POST | `/menu-item/create` | ADMIN/MOD | Create menu item |
| PATCH | `/menu-item/update` | ADMIN/MOD | Update menu item |
| PATCH | `/menu-item/change-position/:id` | ADMIN/MOD | Reorder menu item |
| DELETE | `/menu-item/:id` | ADMIN/MOD | Delete menu item |

### Store Category (`/store-category`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/store-category` | No | Get all store categories (public) |
| GET | `/store-category/:id` | ADMIN/MOD | Get store category details |
| POST | `/store-category/create` | ADMIN/MOD | Create store category |
| PATCH | `/store-category/update` | ADMIN/MOD | Update store category |
| DELETE | `/store-category/delete/:id` | ADMIN/MOD | Delete store category |
| PATCH | `/store-category/change-position/:id` | ADMIN/MOD | Reorder store category |
| POST | `/store-category/translation` | ADMIN/MOD | Add/update category translation |
| DELETE | `/store-category/translation/:id` | ADMIN/MOD | Delete category translation |

### Store Attribute (`/store-attribute`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/store-attribute/category/:categoryId` | ADMIN/MOD | Get attributes by category |
| POST | `/store-attribute/create` | ADMIN/MOD | Create store attribute |
| PATCH | `/store-attribute/update` | ADMIN/MOD | Update store attribute |
| DELETE | `/store-attribute/:id` | ADMIN/MOD | Delete store attribute |
| PATCH | `/store-attribute/change-position` | ADMIN/MOD | Reorder store attribute |
| POST | `/store-attribute/translation/upsert` | ADMIN/MOD | Add/update attribute translation |
| DELETE | `/store-attribute/translation/:id` | ADMIN/MOD | Delete attribute translation |

### Store Item (`/store-item`)

#### Public Endpoints (no auth required)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/store-item/by-category-id/:categoryId?language=` | No | Get items by category ID with translations |
| GET | `/store-item/by-category-slug/:categorySlug?language=` | No | Get items by category slug with translations |
| GET | `/store-item/:id?language=` | No | Get store item by ID with options |

#### Admin Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/store-item/:id` | ADMIN/MOD | Get store item by ID |
| POST | `/store-item/create` | ADMIN/MOD | Create store item |
| PATCH | `/store-item/update` | ADMIN/MOD | Update store item |
| DELETE | `/store-item/delete/:id` | ADMIN/MOD | Delete store item |
| PATCH | `/store-item/change-position/:id` | ADMIN/MOD | Reorder store item |
| POST | `/store-item/translation` | ADMIN/MOD | Add/update item translation |
| DELETE | `/store-item/translation/:id` | ADMIN/MOD | Delete item translation |
| POST | `/store-item/image` | ADMIN/MOD | Add image to store item |
| DELETE | `/store-item/image/:id` | ADMIN/MOD | Remove image from store item |
| PATCH | `/store-item/image/change-position/:id` | ADMIN/MOD | Reorder item image |
| POST | `/store-item/variant` | ADMIN/MOD | Link attribute as item variant |
| DELETE | `/store-item/variant/:id` | ADMIN/MOD | Remove item variant |
| POST | `/store-item/variant/translation` | ADMIN/MOD | Add/update variant attribute translation |
| POST | `/store-item/variant/price` | ADMIN/MOD | Add price for variant |
| DELETE | `/store-item/variant/price/:id` | ADMIN/MOD | Remove variant price |
| POST | `/store-item/base-price` | ADMIN/MOD | Add base price (non-variant items) |
| DELETE | `/store-item/base-price/:id` | ADMIN/MOD | Remove base price |

### Media (`/media`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/media/avatar-url` | JWT | Get avatar URL |
| POST | `/media/upload-avatar` | JWT | Upload avatar (max 1MB, JPEG/PNG/GIF/WebP) |
| DELETE | `/media/remove-avatar` | JWT | Remove avatar |

### Health & Monitoring

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health-check` | No | Check all microservices status |
| GET | `/metrics` | No | Prometheus metrics |
| GET | `/docs` | No | Swagger API documentation |

## Authentication & Authorization

### JWT Strategy
- Access tokens via `Authorization: Bearer <token>` header
- Refresh tokens via HTTP-only cookies

### Google OAuth Flow

The OAuth flow uses a short-lived one-time code pattern to avoid exposing the access token in URL query parameters (prevents server log / Referer leakage).

```
Browser                    API Gateway               Google               User Microservice
   │                           │                        │                        │
   │  GET /auth/google         │                        │                        │
   │──────────────────────────►│                        │                        │
   │                           │  Redirect to Google    │                        │
   │◄──────────────────────────│  (HMAC-signed state)   │                        │
   │                           │                        │                        │
   │  User consents            │                        │                        │
   │────────────────────────────────────────────────-──►│                        │
   │                           │                        │                        │
   │  GET /auth/google/callback?code=...&state=...      │                        │
   │──────────────────────────►│                        │                        │
   │                           │  Verify HMAC state     │                        │
   │                           │  Exchange code         │                        │
   │                           │────────────────────-─► │                        │
   │                           │  ◄── Google profile ──-│                        │
   │                           │                        │                        │
   │                           │  gRPC OAuthSignIn (provider, providerId, ...)   │
   │                           │───────────────────────────────────────────-────►│
   │                           │  ◄─────── accessToken + refreshToken ─────-─────│
   │                           │                        │                        │
   │                           │  Set refresh_token cookie (httpOnly)            │
   │                           │  Store accessToken behind one-time code (60s)   │
   │                           │                        │                        │
   │  302 → /oauth/callback?code=<hex>                  │                        │
   │◄──────────────────────────│                        │                        │
   │                           │                        │                        │
   │  GET /auth/exchange-code?code=<hex>                │                        │
   │──────────────────────────►│                        │                        │
   │  ◄── { accessToken }  ────│                        │                        │
   │                           │                        │                        │
```

**Key security details:**
- **CSRF protection**: The `state` parameter is an HMAC-SHA256-signed token (`timestamp.random.sig`) with a 5-minute TTL. Verification uses `crypto.timingSafeEqual` to prevent timing attacks. No server-side session is required — works across multiple API Gateway instances.
- **Token delivery**: The access token never appears in a redirect URL. After the callback, it is stored server-side behind a random 32-hex-character code. The frontend exchanges the code via `GET /auth/exchange-code?code=` within 60 seconds (single-use).
- **Refresh token**: Delivered as an `httpOnly`, `sameSite: lax` cookie — inaccessible to JavaScript.

**Required environment variables for OAuth:**

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_STATE_SECRET=your_hmac_state_secret
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

The Google OAuth callback URL to register in Google Cloud Console:
```
{BACKEND_URL}/auth/google/callback
```

### Custom Decorators

```typescript
// Require JWT authentication
@Protected()

// Require specific roles
@Protected(UserRole.ADMIN)
@Protected(UserRole.ADMIN, UserRole.MODERATOR)

// Extract user ID from token
@UserId() userId: string
```

### Guards

- **JwtAuthGuard**: Validates JWT tokens
- **RolesGuard**: Enforces role-based access control

## Observability

### Prometheus Metrics

Available at `GET /metrics`:

- `http_request_duration_seconds` - Request latency histogram
- `http_active_requests` - Current active requests gauge
- `http_requests_total` - Total request counter
- `auth_attempts_total` - Total attempts for authentication routes
- `errors_total` - Total errors in routes
- `grpc_client_duration_seconds` - Duration of gRPC requests
- `grpc_client_requests_total` - Total gRPC requests

Labels: `service`, `method`, `route`, `status_code`

### Distributed Tracing

OpenTelemetry integration with Jaeger exporter for request tracing across microservices.

## Error Handling

gRPC errors are automatically mapped to HTTP status codes:

| gRPC Code | HTTP Status |
|-----------|-------------|
| CANCELLED (1) | 422 Unprocessable Entity |
| INVALID_ARGUMENT (3) | 400 Bad Request |
| DEADLINE_EXCEEDED (4) | 504 Gateway Timeout |
| NOT_FOUND (5) | 404 Not Found |
| ALREADY_EXISTS (6) | 409 Conflict |
| PERMISSION_DENIED (7) | 403 Forbidden |
| RESOURCE_EXHAUSTED (8) | 429 Too Many Requests |
| UNAUTHENTICATED (16) | 401 Unauthorized |

## Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

## Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## Protocol Buffers

Proto definitions are located in `/proto/`:

- `auth.proto` - Authentication service
- `user.proto` - User service
- `menu-category.proto` - Menu category service
- `menu-item.proto` - Menu item service
- `store-category.proto` - Store category service
- `store-attribute.proto` - Store attribute service
- `store-item.proto` - Store item service
- `media.proto` - Media service
- `health-check.proto` - Health check service

Generated TypeScript types are in `src/generated-types/`.

## Architecture Diagram

```
┌─────────────┐     HTTP/REST      ┌─────────────────┐
│   Client    │ ─────────────────► │   API Gateway   │
└─────────────┘                    │   (Port 4004)   │
                                   └────────┬────────┘
                                            │
              ┌────────────────┬────────────┼────────────┬────────────────┬────────────────┐
              │                │            │            │                │                │
              ▼ gRPC           ▼ gRPC       ▼ gRPC       ▼ gRPC           ▼ RabbitMQ      ▼ gRPC
     ┌───────────────┐ ┌───────────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐
     │     User      │ │     Menu      │ │  Media   │ │    Store     │ │ Notification │ │ Jaeger  │
     │ Microservice  │ │ Microservice  │ │  Micro   │ │ Microservice │ │ Microservice │ │ Tracing │
     │  (Port 5002)  │ │  (Port 5001)  │ │ (5003)   │ │  (Port 5004) │ │   (Queue)    │ │ (4317)  │
     └───────┬───────┘ └───────┬───────┘ └────┬─────┘ └──────┬───────┘ └──────────────┘ └─────────┘
             │                 │              │               │
             ▼                 ▼              ▼               ▼
     ┌───────────────┐ ┌───────────────┐ ┌──────────┐ ┌───────────────┐
     │   Postgresql  │ │   Postgresql  │ │  AWS S3  │ │  Postgresql   │
     └───────────────┘ └───────────────┘ └──────────┘ └───────────────┘
```

## License

This project is proprietary software for CoffeeDoor.
