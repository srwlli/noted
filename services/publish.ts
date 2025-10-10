import { supabase } from '@/lib/supabase';

/**
 * Published note metadata
 * Represents a note that has been made publicly accessible
 */
export interface PublishedNote {
  id: string;
  note_id: string;
  user_id: string;
  slug: string;
  published_at: string;
  updated_at: string;
}

/**
 * Rate limit tracking for publish operations
 */
export interface PublishRateLimit {
  user_id: string;
  last_publish_at: string;
  publish_count_today: number;
  reset_at: string;
}

/**
 * Response from publish Edge Function
 */
export interface PublishResponse {
  success: boolean;
  slug?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Publish service for managing public note sharing
 */
export const publishService = {
  /**
   * Publish a note to make it publicly accessible
   * @param noteId - ID of note to publish
   * @param noteTitle - Title of note (used for slug generation)
   * @param noteContent - Content of note (validated server-side)
   * @returns Public URL and metadata
   */
  async publishNote(
    noteId: string,
    noteTitle: string,
    noteContent: string
  ): Promise<PublishResponse> {
    try {
      // Get current user's JWT token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return {
          success: false,
          error: 'UNAUTHORIZED'
        };
      }

      // Call Edge Function with JWT in Authorization header
      const { data, error } = await supabase.functions.invoke('publish-note', {
        body: {
          noteId,
          noteTitle,
          noteContent
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        return {
          success: false,
          error: 'DATABASE_ERROR'
        };
      }

      return data as PublishResponse;
    } catch (error: any) {
      console.error('Publish error:', error);
      return {
        success: false,
        error: error.message || 'DATABASE_ERROR'
      };
    }
  },

  /**
   * Unpublish a note (make it private again)
   * @param noteId - ID of note to unpublish
   */
  async unpublishNote(noteId: string): Promise<void> {
    const { error } = await supabase
      .from('published_notes')
      .delete()
      .eq('note_id', noteId);

    if (error) {
      console.error('Unpublish error:', error);
      throw new Error(`Failed to unpublish: ${error.message}`);
    }
  },

  /**
   * Check if a note is currently published
   * @param noteId - ID of note to check
   * @returns Published note metadata if published, null otherwise
   */
  async getPublishedNote(noteId: string): Promise<PublishedNote | null> {
    const { data, error } = await supabase
      .from('published_notes')
      .select('*')
      .eq('note_id', noteId)
      .maybeSingle();

    if (error) {
      console.error('Get published note error:', error);
      throw new Error(`Failed to get published note: ${error.message}`);
    }

    return data as PublishedNote | null;
  },

  /**
   * Get public note by slug (for viewing)
   * @param slug - URL slug of published note
   * @returns Note content and metadata if found
   */
  async getPublicNoteBySlug(slug: string) {
    // Query published_notes to get note_id
    const { data: publishedNote, error: publishError } = await supabase
      .from('published_notes')
      .select('note_id, published_at, slug')
      .eq('slug', slug)
      .maybeSingle();

    if (publishError || !publishedNote) {
      return null;
    }

    // Query notes table (RLS allows public access to published notes)
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('id, title, content, created_at, updated_at')
      .eq('id', publishedNote.note_id)
      .single();

    if (noteError || !note) {
      return null;
    }

    return {
      ...note,
      published_at: publishedNote.published_at,
      slug: publishedNote.slug
    };
  },

  /**
   * Get current user's rate limit status
   * @returns Rate limit info or null if no publishes yet
   */
  async getRateLimit(): Promise<PublishRateLimit | null> {
    const { data, error } = await supabase
      .from('publish_rate_limits')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Get rate limit error:', error);
      return null;
    }

    return data as PublishRateLimit | null;
  },

  /**
   * Check how many publishes the user has remaining today
   * @returns Number of publishes remaining (0-50)
   */
  async getPublishesRemaining(): Promise<number> {
    const rateLimit = await this.getRateLimit();

    if (!rateLimit) {
      return 50; // No publishes yet = full quota
    }

    const now = new Date();
    const resetAt = new Date(rateLimit.reset_at);

    // If past reset time, quota is reset
    if (now >= resetAt) {
      return 50;
    }

    // Calculate remaining
    const remaining = 50 - rateLimit.publish_count_today;
    return Math.max(0, remaining);
  },

  /**
   * Get all published notes for current user
   * @returns Array of published note metadata
   */
  async getUserPublishedNotes(): Promise<PublishedNote[]> {
    const { data, error } = await supabase
      .from('published_notes')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Get user published notes error:', error);
      throw new Error(`Failed to get published notes: ${error.message}`);
    }

    return data as PublishedNote[];
  }
};
