import { supabase } from '@/lib/supabase';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
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
  async createNote(title: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .insert({
        title,
        content,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Note;
  },

  // Update an existing note
  async updateNote(id: string, title: string, content: string) {
    const { data, error } = await supabase
      .from('notes')
      .update({
        title,
        content,
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
  }
};