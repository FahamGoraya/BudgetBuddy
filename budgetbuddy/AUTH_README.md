# JWT-Based Authentication Implementation

## 🔐 Features Implemented

- ✅ JWT token generation and verification
- ✅ Password hashing with bcrypt
- ✅ Login API endpoint (`/api/auth/login`)
- ✅ Registration API endpoint (`/api/auth/register`)
- ✅ Token verification endpoint (`/api/auth/verify`)
- ✅ Updated AuthContext to use JWT APIs
- ✅ Automatic token validation on page load
- ✅ Helper utilities for authenticated requests

## 📁 API Endpoints

### POST /api/auth/login
Login with email and password
```json
{
  "email": "john@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "JD",
    "currency": "USD",
    "joinedDate": "2025-01-15"
  }
}
```

### POST /api/auth/register
Register a new user
```json
{
  "email": "jane@example.com",
  "password": "password123",
  "name": "Jane Smith"
}
```

### GET /api/auth/verify
Verify JWT token (requires Bearer token in Authorization header)

## 🔑 Test Credentials

**Email:** john@example.com  
**Password:** password

## 🛠️ Setup

1. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

2. Update JWT_SECRET in `.env.local` with a secure random string

3. Start the development server:
```bash
npm run dev
```

## 🔒 Security Notes

- Tokens expire after 7 days
- Passwords are hashed with bcrypt (10 salt rounds)
- Token is stored in localStorage
- Token is automatically verified on app load
- Invalid tokens trigger automatic logout

## 📝 Usage Example

```typescript
import { fetchWithAuth } from "@/app/lib/auth";

// Make authenticated API request
const response = await fetchWithAuth("/api/protected-endpoint", {
  method: "POST",
  body: JSON.stringify({ data: "value" })
});
```

## 🔄 Next Steps

- Connect to a real database (PostgreSQL, MongoDB, etc.)
- Add refresh token mechanism
- Implement password reset functionality
- Add email verification
- Set up rate limiting
- Add role-based access control
