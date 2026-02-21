/**
 * @fileOverview Utility for haptic feedback.
 * Uses the Web Vibration API as a fallback, ready for @capacitor/haptics.
 */

export const haptics = {
  /**
   * Triggers a light vibration for standard interactions.
   */
  light: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(10);
      } catch (e) {
        // Silently fail if not supported or blocked
      }
    }
  },

  /**
   * Triggers a success vibration pattern.
   */
  success: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate([10, 30, 10]);
      } catch (e) {
        // Silently fail
      }
    }
  },

  /**
   * Triggers an error/warning vibration pattern.
   */
  error: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate([50, 100, 50]);
      } catch (e) {
        // Silently fail
      }
    }
  }
};
