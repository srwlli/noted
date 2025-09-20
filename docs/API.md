# Noted API Documentation

**Date**: 2025-09-20
**Version**: 1.0.0

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URLs](#base-urls)
4. [Authentication Endpoints](#authentication-endpoints)
5. [Notes Endpoints](#notes-endpoints)
6. [User Endpoints](#user-endpoints)
7. [Settings Endpoints](#settings-endpoints)
8. [Data Schemas](#data-schemas)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [Pagination](#pagination)

## Overview

The Noted API provides a RESTful interface for managing personal notes and user authentication. This API is designed to support the Noted mobile application, which allows users to create, read, update, and delete personal notes with a clean, minimal interface.

**Base Architecture**: RESTful API following OpenAPI 3.0 specification
**Data Format**: JSON
**Authentication**: Bearer Token (JWT)
**Content-Type**: application/json

## Authentication

All API endpoints except authentication routes require a valid Bearer token in the Authorization header.

```
Authorization: Bearer <your_jwt_token>
```

## Base URLs

- **Development**: `https://api-dev.noted.app/v1`
- **Production**: `https://api.noted.app/v1`

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-09-20T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**cURL Example:**
```bash
curl -X POST "https://api.noted.app/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

### POST /auth/login

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "user@example.com",
      "name": "John Doe",
      "lastLoginAt": "2025-09-20T12:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/forgot-password

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent if account exists"
}
```

### POST /auth/reset-password

Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset_token_123",
  "newPassword": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Notes Endpoints

### GET /notes

Retrieve all notes for the authenticated user.

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `search` (string, optional): Search query for note titles and content
- `sortBy` (string, optional): Sort field (title, createdAt, updatedAt)
- `sortOrder` (string, optional): Sort order (asc, desc)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "note_456def",
        "title": "Meeting Notes",
        "content": "Discussion points from team meeting...",
        "createdAt": "2025-01-20T10:30:00Z",
        "updatedAt": "2025-01-20T14:45:00Z"
      },
      {
        "id": "note_789ghi",
        "title": "Grocery List",
        "content": "Milk, Bread, Eggs...",
        "createdAt": "2025-01-18T09:15:00Z",
        "updatedAt": "2025-01-18T09:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 42,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**cURL Example:**
```bash
curl -X GET "https://api.noted.app/v1/notes?page=1&limit=10&search=meeting" \
  -H "Authorization: Bearer your_jwt_token"
```

### GET /notes/:id

Retrieve a specific note by ID.

**Parameters:**
- `id` (string): Note ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note_456def",
      "title": "Meeting Notes",
      "content": "Discussion points from team meeting...",
      "createdAt": "2025-01-20T10:30:00Z",
      "updatedAt": "2025-01-20T14:45:00Z"
    }
  }
}
```

### POST /notes

Create a new note.

**Request Body:**
```json
{
  "title": "Project Ideas",
  "content": "List of potential project ideas to explore..."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note_abc123",
      "title": "Project Ideas",
      "content": "List of potential project ideas to explore...",
      "createdAt": "2025-09-20T12:00:00Z",
      "updatedAt": "2025-09-20T12:00:00Z"
    }
  }
}
```

### PUT /notes/:id

Update an existing note.

**Parameters:**
- `id` (string): Note ID

**Request Body:**
```json
{
  "title": "Updated Project Ideas",
  "content": "Updated list of potential project ideas..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": "note_abc123",
      "title": "Updated Project Ideas",
      "content": "Updated list of potential project ideas...",
      "createdAt": "2025-09-20T12:00:00Z",
      "updatedAt": "2025-09-20T12:30:00Z"
    }
  }
}
```

### DELETE /notes/:id

Delete a note.

**Parameters:**
- `id` (string): Note ID

**Response (200):**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

## User Endpoints

### GET /user/profile

Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-01-01T12:00:00Z",
      "lastLoginAt": "2025-09-20T12:00:00Z",
      "notesCount": 42
    }
  }
}
```

### PUT /user/profile

Update user profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "john.smith@example.com",
      "name": "John Smith",
      "updatedAt": "2025-09-20T12:00:00Z"
    }
  }
}
```

## Settings Endpoints

### GET /user/settings

Get user settings and preferences.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "theme": "dark",
      "fontSize": "medium",
      "notifications": {
        "email": true,
        "push": false
      },
      "privacy": {
        "shareAnalytics": false
      }
    }
  }
}
```

### PUT /user/settings

Update user settings.

**Request Body:**
```json
{
  "theme": "light",
  "fontSize": "large",
  "notifications": {
    "email": false,
    "push": true
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "theme": "light",
      "fontSize": "large",
      "notifications": {
        "email": false,
        "push": true
      },
      "privacy": {
        "shareAnalytics": false
      }
    }
  }
}
```

## Data Schemas

### User Schema
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "lastLoginAt": "string (ISO 8601)"
}
```

### Note Schema
```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "userId": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### Settings Schema
```json
{
  "theme": "string (light|dark|auto)",
  "fontSize": "string (small|medium|large)",
  "notifications": {
    "email": "boolean",
    "push": "boolean"
  },
  "privacy": {
    "shareAnalytics": "boolean"
  }
}
```

## Error Handling

All errors follow a consistent format:

### Error Response Schema
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

### Common Error Codes

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied to this resource"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Note not found"
  }
}
```

#### 409 Conflict
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email already exists"
  }
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "details": {
      "retryAfter": 300
    }
  }
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage and prevent abuse.

### Limits

- **Authentication endpoints**: 5 requests per minute per IP
- **General API endpoints**: 100 requests per minute per user
- **Note creation**: 10 requests per minute per user

### Headers

Rate limit information is provided in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642677600
```

## Pagination

List endpoints support pagination using query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Pagination Response
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 42,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Navigation Links
```bash
# Get next page
curl -X GET "https://api.noted.app/v1/notes?page=2&limit=20"

# Get previous page
curl -X GET "https://api.noted.app/v1/notes?page=1&limit=20"
```

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

This API documentation provides the technical interface reference for the Noted application, designed to support a clean and minimal note-taking experience with modern authentication and data management capabilities.