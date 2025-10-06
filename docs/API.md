# Noted API Documentation

**Date**: October 6, 2025
**Version**: 2.1.0

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URLs](#base-urls)
4. [Authentication Endpoints](#authentication-endpoints)
5. [Notes Endpoints](#notes-endpoints)
6. [Folders Endpoints](#folders-endpoints)
7. [User Endpoints](#user-endpoints)
8. [Data Schemas](#data-schemas)
9. [Error Handling](#error-handling)
10. [Services Layer](#services-layer)

## Overview

The Noted API provides a Supabase-powered interface for managing notes with folder organization and user authentication. This API supports the Noted Progressive Web App (PWA) built with React Native and Expo Router, enabling users to create, read, update, and delete notes organized in folders with comprehensive offline support.

**Base Architecture**: Supabase REST API with Row Level Security (RLS)
**Data Format**: JSON
**Authentication**: Supabase Auth with JWT tokens
**Content-Type**: application/json
**Backend**: Supabase (PostgreSQL + Auth + Real-time)
**Services Layer**: Type-safe CRUD operations via services/notes.ts and services/folders.ts

*References: README.md provides setup and quickstart information for the client application.*

## Authentication

All API endpoints except authentication routes require a valid Bearer token in the Authorization header.

```
Authorization: Bearer <your_jwt_token>
```

## Base URLs

- **Supabase API**: `https://ikovzegiuzjkubymwvjz.supabase.co/rest/v1`
- **Supabase Auth**: `https://ikovzegiuzjkubymwvjz.supabase.co/auth/v1`
- **Client Application**: React Native app with Expo Router

## Authentication Endpoints

### POST /auth/v1/signup

Register a new user account via Supabase Auth.

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
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "user@example.com",
    "created_at": "2025-09-21T12:00:00.000000+00:00",
    "email_confirmed_at": null,
    "app_metadata": {},
    "user_metadata": {}
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "refresh_token_here"
  }
}
```

**cURL Example:**
```bash
curl -X POST "https://ikovzegiuzjkubymwvjz.supabase.co/auth/v1/signup" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### POST /auth/v1/token?grant_type=password

Authenticate an existing user with email and password.

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
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "user@example.com",
    "created_at": "2025-09-21T12:00:00.000000+00:00",
    "last_sign_in_at": "2025-09-21T12:00:00.000000+00:00"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "refresh_token_here"
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

### GET /rest/v1/notes

Retrieve all notes for the authenticated user via Supabase REST API with RLS.

**Query Parameters:**
- `offset` (integer): Number of items to skip (pagination)
- `limit` (integer): Items per page (default: 20, max: 1000)
- `title` (string): Filter by title using pattern matching
- `content` (string): Filter by content using pattern matching
- `order` (string): Sort order (e.g., `created_at.desc`, `title.asc`)
- `select` (string): Columns to select (default: `*`)

**Headers:**
```
Authorization: Bearer your_supabase_jwt
Apikey: your_supabase_anon_key
Content-Type: application/json
```

**Response (200):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Meeting Notes",
    "content": "Discussion points from team meeting...",
    "user_id": "user-uuid-here",
    "is_favorite": true,
    "created_at": "2025-01-20T10:30:00.000000+00:00",
    "updated_at": "2025-01-20T14:45:00.000000+00:00"
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "title": "Grocery List",
    "content": "Milk, Bread, Eggs...",
    "user_id": "user-uuid-here",
    "is_favorite": false,
    "created_at": "2025-01-18T09:15:00.000000+00:00",
    "updated_at": "2025-01-18T09:15:00.000000+00:00"
  }
]
```

**cURL Example:**
```bash
curl -X GET "https://ikovzegiuzjkubymwvjz.supabase.co/rest/v1/notes?order=created_at.desc&limit=10" \
  -H "Authorization: Bearer your_supabase_jwt" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

### POST /rest/v1/notes

Create a new note. The user_id is automatically set from the authenticated user via RLS.

**Request Body:**
```json
{
  "title": "Project Ideas",
  "content": "List of potential project ideas to explore..."
}
```

**Headers:**
```
Authorization: Bearer your_supabase_jwt
Apikey: your_supabase_anon_key
Content-Type: application/json
Prefer: return=representation
```

**Response (201):**
```json
[
  {
    "id": "c3d4e5f6-g7h8-9012-cdef-g34567890123",
    "title": "Project Ideas",
    "content": "List of potential project ideas to explore...",
    "user_id": "user-uuid-here",
    "is_favorite": false,
    "created_at": "2025-09-21T12:00:00.000000+00:00",
    "updated_at": "2025-09-21T12:00:00.000000+00:00"
  }
]
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

### GET /rest/v1/notes (Filter by Favorites)

Retrieve all favorite notes for the authenticated user.

**Query Parameters:**
- `is_favorite` (boolean): Filter by favorite status
- `order` (string): Sort order (e.g., `created_at.desc`, `title.asc`)

**Headers:**
```
Authorization: Bearer your_supabase_jwt
Apikey: your_supabase_anon_key
```

**Response (200):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Important Meeting Notes",
    "content": "Critical discussion points...",
    "user_id": "user-uuid-here",
    "is_favorite": true,
    "created_at": "2025-01-20T10:30:00.000000+00:00",
    "updated_at": "2025-01-20T14:45:00.000000+00:00"
  }
]
```

**cURL Example:**
```bash
curl -X GET "https://ikovzegiuzjkubymwvjz.supabase.co/rest/v1/notes?is_favorite=eq.true&order=updated_at.desc" \
  -H "Authorization: Bearer your_supabase_jwt" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### PATCH /rest/v1/notes?id=eq.{note_id}

Toggle favorite status for a note.

**Request Body:**
```json
{
  "is_favorite": true
}
```

**Headers:**
```
Authorization: Bearer your_supabase_jwt
Apikey: your_supabase_anon_key
Content-Type: application/json
Prefer: return=representation
```

**Response (200):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Meeting Notes",
    "content": "Discussion points from team meeting...",
    "user_id": "user-uuid-here",
    "is_favorite": true,
    "created_at": "2025-01-20T10:30:00.000000+00:00",
    "updated_at": "2025-01-20T14:45:00.000000+00:00"
  }
]
```

---

## Folders Endpoints

### GET /rest/v1/folders

Get all folders for the authenticated user.

**Headers:**
```
Authorization: Bearer your_supabase_jwt
Apikey: your_supabase_anon_key
```

**Response (200):**
```json
[
  {
    "id": "folder-uuid-1",
    "name": "Work Notes",
    "user_id": "user-uuid",
    "parent_folder_id": null,
    "is_favorite": true,
    "created_at": "2025-10-02T10:00:00.000000+00:00",
    "updated_at": "2025-10-02T10:00:00.000000+00:00"
  },
  {
    "id": "folder-uuid-2",
    "name": "Personal",
    "user_id": "user-uuid",
    "parent_folder_id": null,
    "is_favorite": false,
    "created_at": "2025-10-02T11:00:00.000000+00:00",
    "updated_at": "2025-10-02T11:00:00.000000+00:00"
  }
]
```

### POST /rest/v1/folders

Create a new folder.

**Request Body:**
```json
{
  "name": "Project Notes",
  "parent_folder_id": null
}
```

**Headers:**
```
Authorization: Bearer your_supabase_jwt
Apikey: your_supabase_anon_key
Content-Type: application/json
Prefer: return=representation
```

**Response (201):**
```json
[
  {
    "id": "new-folder-uuid",
    "name": "Project Notes",
    "user_id": "user-uuid",
    "parent_folder_id": null,
    "is_favorite": false,
    "created_at": "2025-10-02T12:00:00.000000+00:00",
    "updated_at": "2025-10-02T12:00:00.000000+00:00"
  }
]
```

**Validation:**
- `name`: Required, 1-255 characters, cannot be empty/whitespace
- `parent_folder_id`: Optional, must reference existing folder

### PATCH /rest/v1/folders?id=eq.{folder_id}

Update folder name.

**Request Body:**
```json
{
  "name": "Updated Folder Name"
}
```

**Response (200):**
```json
[
  {
    "id": "folder-uuid",
    "name": "Updated Folder Name",
    "user_id": "user-uuid",
    "parent_folder_id": null,
    "is_favorite": false,
    "created_at": "2025-10-02T12:00:00.000000+00:00",
    "updated_at": "2025-10-02T13:00:00.000000+00:00"
  }
]
```

### DELETE /rest/v1/folders?id=eq.{folder_id}

Delete a folder. Notes in the folder will have `folder_id` set to `null` (ON DELETE SET NULL).

**Response (204):**
No content

### GET /rest/v1/folders (Filter by Favorites)

Retrieve all favorite folders for the authenticated user.

**Query Parameters:**
- `is_favorite` (boolean): Filter by favorite status
- `order` (string): Sort order (e.g., `created_at.desc`, `name.asc`)

**Headers:**
```
Authorization: Bearer your_supabase_jwt
Apikey: your_supabase_anon_key
```

**Response (200):**
```json
[
  {
    "id": "folder-uuid-1",
    "name": "Important Work Notes",
    "user_id": "user-uuid",
    "parent_folder_id": null,
    "is_favorite": true,
    "created_at": "2025-10-02T10:00:00.000000+00:00",
    "updated_at": "2025-10-02T10:00:00.000000+00:00"
  }
]
```

**cURL Example:**
```bash
curl -X GET "https://ikovzegiuzjkubymwvjz.supabase.co/rest/v1/folders?is_favorite=eq.true&order=name.asc" \
  -H "Authorization: Bearer your_supabase_jwt" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### PATCH /rest/v1/folders?id=eq.{folder_id}

Toggle favorite status for a folder.

**Request Body:**
```json
{
  "is_favorite": true
}
```

**Headers:**
```
Authorization: Bearer your_supabase_jwt
Apikey: your_supabase_anon_key
Content-Type: application/json
Prefer: return=representation
```

**Response (200):**
```json
[
  {
    "id": "folder-uuid",
    "name": "Work Notes",
    "user_id": "user-uuid",
    "parent_folder_id": null,
    "is_favorite": true,
    "created_at": "2025-10-02T12:00:00.000000+00:00",
    "updated_at": "2025-10-02T13:00:00.000000+00:00"
  }
]
```

---

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

### Note Schema (PostgreSQL via Supabase)
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**JSON Response Schema:**
```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "user_id": "uuid",
  "is_favorite": "boolean",
  "created_at": "string (ISO 8601 with timezone)",
  "updated_at": "string (ISO 8601 with timezone)"
}
```

### Folder Schema (PostgreSQL via Supabase)
```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**JSON Response Schema:**
```json
{
  "id": "uuid",
  "name": "string",
  "user_id": "uuid",
  "parent_folder_id": "uuid | null",
  "is_favorite": "boolean",
  "created_at": "string (ISO 8601 with timezone)",
  "updated_at": "string (ISO 8601 with timezone)"
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

Supabase implements rate limiting to ensure fair usage and prevent abuse.

### Limits

- **Authentication endpoints**: 30 requests per hour per IP (Supabase Auth)
- **REST API endpoints**: 100 requests per second (configurable per project)
- **Real-time connections**: Up to 200 concurrent connections per project
- **Storage uploads**: 100 MB per hour per project

### Supabase Headers

Rate limit information may be provided in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642677600
```

*Note: Rate limiting configuration varies by Supabase plan (Free, Pro, Team, Enterprise).*

## Pagination

Supabase REST API supports offset-based pagination using query parameters:

- `offset`: Number of items to skip (default: 0)
- `limit`: Items per page (default: unlimited, max: 1000)

### Pagination with Range Headers

Supabase also supports range-based pagination:

```bash
# Get items 0-19 (first 20 items)
curl -X GET "https://ikovzegiuzjkubymwvjz.supabase.co/rest/v1/notes" \
  -H "Range: 0-19" \
  -H "Authorization: Bearer your_jwt"

# Get items 20-39 (next 20 items)
curl -X GET "https://ikovzegiuzjkubymwvjz.supabase.co/rest/v1/notes" \
  -H "Range: 20-39" \
  -H "Authorization: Bearer your_jwt"
```

### Response Headers

Pagination info is provided in response headers:

```
Content-Range: 0-19/42
Accept-Ranges: items
```

### Query Parameter Pagination
```bash
# Using offset and limit
curl -X GET "https://ikovzegiuzjkubymwvjz.supabase.co/rest/v1/notes?offset=20&limit=20" \
  -H "Authorization: Bearer your_jwt"
```

## Row Level Security (RLS)

The notes table implements Row Level Security to ensure users can only access their own notes:

```sql
-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notes
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own notes
CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own notes
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own notes
CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);
```

## Services Layer

**Recommended Approach**: Use the services layer instead of direct Supabase calls for type safety and abstraction.

**Location**: `services/notes.ts`, `services/folders.ts`

### Notes Service

```typescript
// services/notes.ts
import { supabase } from '@/lib/supabase';

// Get all notes
export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get notes by folder
export async function getNotesByFolder(folderId: string | null): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('folder_id', folderId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get favorite notes
export async function getFavoriteNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('is_favorite', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Create note
export async function createNote(note: CreateNoteRequest): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert([{
      title: note.title,
      content: note.content || '',
      folder_id: note.folder_id || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update note
export async function updateNote(id: string, updates: UpdateNoteRequest): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete note
export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Toggle note favorite
export async function toggleNoteFavorite(id: string, isFavorite: boolean): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ is_favorite: isFavorite })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Folders Service

```typescript
// services/folders.ts
import { supabase } from '@/lib/supabase';

// Get all folders
export async function getFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Create folder
export async function createFolder(name: string): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update folder
export async function updateFolder(id: string, name: string): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete folder
export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Get favorite folders
export async function getFavoriteFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('is_favorite', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Toggle folder favorite
export async function toggleFolderFavorite(id: string, isFavorite: boolean): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .update({ is_favorite: isFavorite })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Usage in Components

```typescript
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getFavoriteNotes,
  toggleNoteFavorite
} from '@/services/notes';
import {
  getFolders,
  createFolder,
  getFavoriteFolders,
  toggleFolderFavorite
} from '@/services/folders';

// In component
const notes = await getNotes();
const favoriteNotes = await getFavoriteNotes();
const folders = await getFolders();
const favoriteFolders = await getFavoriteFolders();

const newNote = await createNote({
  title: 'My Note',
  content: 'Note content',
  folder_id: selectedFolderId,
});

await updateNote(noteId, { title: 'Updated Title' });
await deleteNote(noteId);
await toggleNoteFavorite(noteId, true);

const newFolder = await createFolder('Work Notes');
await toggleFolderFavorite(folderId, true);
```

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

*This API documentation provides the technical interface reference for the Noted Progressive Web App's Supabase backend, designed to support note-taking with folder organization, 10-theme system, and comprehensive offline support. The services layer provides type-safe abstractions over direct Supabase calls for improved maintainability and error handling.*

**Key Updates in 2.1.0:**
- **Favorites System**: Added `is_favorite` field to both notes and folders with toggle endpoints
- **Favorite Filtering**: New endpoints to retrieve only favorite notes and folders
- **Enhanced Services**: Added `getFavoriteNotes()`, `toggleNoteFavorite()`, `getFavoriteFolders()`, and `toggleFolderFavorite()` methods
- **Dashboard Support**: API now fully supports dashboard favorites display

**Previous Updates (2.0.0):**
- **Folders Endpoints**: Full CRUD operations for folder management with hierarchical support
- **Services Layer**: Type-safe abstraction layer (services/notes.ts, services/folders.ts) recommended over direct Supabase calls
- **Enhanced RLS**: Row-Level Security policies on both notes and folders tables
- **Input Validation**: Database-level constraints (title: 200 chars, content: 50,000 chars, folder name: 255 chars)

*References: README.md for client setup, ARCHITECTURE.md for system design, SCHEMA.md for database schema and types.*