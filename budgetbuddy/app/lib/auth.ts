// Utility functions for authentication
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Server-side: Get current user from request (cookies or headers)
export function getCurrentUser(request: Request): { userId: string; email: string } | null {
  try {
    // Try to get token from cookie first
    const cookieHeader = request.headers.get("cookie");
    let token: string | null = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies['token'];
    }
    
    // Fallback to Authorization header if no cookie
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    return decoded;
  } catch (error) {
    return null;
  }
}

// Client-side: Get token from localStorage
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies in all requests
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  // If unauthorized, redirect to login
  if (response.status === 401) {
    removeToken();
    window.location.href = "/";
  }

  return response;
}
