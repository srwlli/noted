# Working Plan: Notes CRUD Implementation

## Simple Notes CRUD with Supabase Auth

### Database Schema
- Create basic `notes` table with:
  - `id` (UUID primary key)
  - `title` (text)
  - `content` (text)
  - `created_at`, `updated_at` (timestamps)
  - `user_id` (UUID) - references auth.users automatically

### RLS Policies
- Enable RLS on notes table
- Users can only access their own notes using auth.uid()
- Basic CRUD policies using Supabase auth metadata

### Implementation
- Create SQL schema file
- Set up notes service with CRUD operations
- Update notes page to use real Supabase data
- Use Supabase auth.user() for user_id automatically

## Notes
- Start with minimal viable schema
- User ID comes from Supabase auth metadata
- Focus on basic save, edit, delete functionality