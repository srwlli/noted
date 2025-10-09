/**
 * Analytics Service
 *
 * Centralized analytics tracking for the app.
 * Currently logs events to console in development.
 * Can be integrated with analytics providers (Amplitude, Mixpanel, PostHog) later.
 */

import type { EditType } from './ai/edits/types';

interface BaseEventProperties {
  [key: string]: string | number | boolean | string[] | undefined | null;
}

interface AIEditsOpenedProperties extends BaseEventProperties {
  note_length: number;
  has_previous_edits: boolean;
}

interface AIEditsOptionsSelectedProperties extends BaseEventProperties {
  selected_edits: string[];
  length_adjustment: 'keep' | 'concise' | 'expand';
  tone: 'none' | 'professional' | 'technical' | 'clear';
  total_options: number;
}

interface AIEditsProcessingStartedProperties extends BaseEventProperties {
  edit_count: number;
  estimated_duration: number;
}

interface AIEditsProcessingCompletedProperties extends BaseEventProperties {
  duration_ms: number;
  successful_edits: number;
  failed_edits: number;
  character_delta: number;
  change_percentage: number;
}

interface AIEditsAppliedProperties extends BaseEventProperties {
  edits_applied: string[];
  final_length: number;
  user_viewed_comparison: boolean;
}

interface AIEditsCancelledProperties extends BaseEventProperties {
  stage: 'selection' | 'processing' | 'preview';
  edits_selected: string[];
}

interface AIEditsRegeneratedProperties extends BaseEventProperties {
  same_options: boolean;
  previous_duration_ms: number;
}

interface AIEditsErrorProperties extends BaseEventProperties {
  error_code: string;
  error_message: string;
  stage: 'validation' | 'processing' | 'saving';
  retryable: boolean;
}

class AnalyticsService {
  private isEnabled = __DEV__; // Only log in development for now

  /**
   * Track a generic event
   */
  private track(eventName: string, properties?: BaseEventProperties) {
    if (!this.isEnabled) return;

    console.log('[Analytics]', eventName, properties);

    // TODO: Integrate with analytics provider
    // Example integrations:
    // - Amplitude: amplitude.track(eventName, properties);
    // - Mixpanel: mixpanel.track(eventName, properties);
    // - PostHog: posthog.capture(eventName, properties);
  }

  /**
   * AI Edits: User opens the AI Edits modal
   */
  trackAIEditsOpened(properties: AIEditsOpenedProperties) {
    this.track('ai_edits_opened', properties);
  }

  /**
   * AI Edits: User selects edit options and clicks Preview
   */
  trackAIEditsOptionsSelected(properties: AIEditsOptionsSelectedProperties) {
    this.track('ai_edits_options_selected', properties);
  }

  /**
   * AI Edits: Processing starts (API call initiated)
   */
  trackAIEditsProcessingStarted(properties: AIEditsProcessingStartedProperties) {
    this.track('ai_edits_processing_started', properties);
  }

  /**
   * AI Edits: Processing completes (success or partial failure)
   */
  trackAIEditsProcessingCompleted(properties: AIEditsProcessingCompletedProperties) {
    this.track('ai_edits_processing_completed', properties);
  }

  /**
   * AI Edits: User applies edits to note
   */
  trackAIEditsApplied(properties: AIEditsAppliedProperties) {
    this.track('ai_edits_applied', properties);
  }

  /**
   * AI Edits: User cancels at any stage
   */
  trackAIEditsCancelled(properties: AIEditsCancelledProperties) {
    this.track('ai_edits_cancelled', properties);
  }

  /**
   * AI Edits: User regenerates edits
   */
  trackAIEditsRegenerated(properties: AIEditsRegeneratedProperties) {
    this.track('ai_edits_regenerated', properties);
  }

  /**
   * AI Edits: Error occurs at any stage
   */
  trackAIEditsError(properties: AIEditsErrorProperties) {
    this.track('ai_edits_error', properties);
  }
}

export const analytics = new AnalyticsService();
