import { supabase } from '@/lib/supabase';

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  parent_folder_id: string | null;
  is_favorite: boolean; // Track if folder is favorited
  created_at: string;
  updated_at: string;
}

export const foldersService = {
  // Fetch all folders for current user
  async getFolders() {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Folder[];
  },

  // Get a single folder
  async getFolder(id: string) {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Folder;
  },

  // Create a new folder
  async createFolder(name: string, parent_folder_id?: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        user_id: user.id,
        parent_folder_id: parent_folder_id || null
      })
      .select()
      .single();

    if (error) throw error;
    return data as Folder;
  },

  // Update a folder (rename)
  async updateFolder(id: string, name: string) {
    const { data, error } = await supabase
      .from('folders')
      .update({
        name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Folder;
  },

  // Delete a folder
  async deleteFolder(id: string) {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Move a note to a folder
  async moveNoteToFolder(noteId: string, folderId: string | null) {
    const { data, error } = await supabase
      .from('notes')
      .update({
        folder_id: folderId,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get favorite folders for current user
  async getFavoriteFolders() {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('is_favorite', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Folder[];
  },

  // Toggle folder favorite status
  async toggleFavorite(folderId: string, isFavorite: boolean) {
    const { data, error } = await supabase
      .from('folders')
      .update({
        is_favorite: isFavorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId)
      .select()
      .single();

    if (error) throw error;
    return data as Folder;
  }
};
