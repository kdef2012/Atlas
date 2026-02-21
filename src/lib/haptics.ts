
/**
 * @fileOverview Utility for haptic feedback.
 * Uses the Web Vibration API as a fallback, ready for @capacitor/haptics.
 */

export const haptics = {
  /**
   * Triggers a light vibration for standard interactions.
   */
  light: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  },

  /**
   * Triggers a success vibration pattern.
   */
  success: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([10, 30, 10]);
    }
  },

  /**
   * Triggers an error/warning vibration pattern.
   */
  error: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([50, 100, 50]);
    }
  }
};
