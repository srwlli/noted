import { supabase } from '@/lib/supabase';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  folder_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export const notesService = {
  // Fetch all notes for current user
  async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Note[];
  },

  // Get a single note
  async getNote(id: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Note;
  },

  // Create a new note
  async createNote(title: string, content: string, folder_id?: string | null) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .insert({
        title,
        content,
        user_id: user.id,
        folder_id: folder_id || null
      })
      .select()
      .single();

    if (error) throw error;
    return data as Note;
  },

  // Update an existing note
  async updateNote(id: string, title: string, content: string, folder_id?: string | null) {
    const { data, error } = await supabase
      .from('notes')
      .update({
        title,
        content,
        folder_id: folder_id !== undefined ? folder_id : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Note;
  },

  // Delete a note
  async deleteNote(id: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get notes by folder
  async getNotesByFolder(folderId: string | null) {
    let query = supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (folderId === null) {
      // Return all notes when folderId is null
      const { data, error } = await query;
      if (error) throw error;
      return data as Note[];
    } else if (folderId === 'unfiled') {
      // Return only notes without a folder
      const { data, error } = await query.is('folder_id', null);
      if (error) throw error;
      return data as Note[];
    } else {
      // Filter by specific folder
      const { data, error } = await query.eq('folder_id', folderId);
      if (error) throw error;
      return data as Note[];
    }
  },

  // Toggle favorite status of a note
  async toggleFavorite(noteId: string, isFavorite: boolean) {
    const { error } = await supabase
      .from('notes')
      .update({ is_favorite: isFavorite })
      .eq('id', noteId);

    if (error) throw error;
  },

  // Get all favorited notes for Dashboard
  async getFavoriteNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('is_favorite', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Note[];
  },

  // Get recent non-favorite notes for Dashboard "Last 3" section
  async getRecentNonFavoriteNotes(limit: number = 3) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('is_favorite', false)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Note[];
  }
};