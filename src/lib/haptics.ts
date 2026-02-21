/**
 * @fileOverview Utility for haptic feedback.
 * Uses @capacitor/haptics for native mobile and Web Vibration API as fallback.
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const haptics = {
  /**
   * Triggers a light vibration for standard interactions.
   */
  light: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
    }
  },

  /**
   * Triggers a success vibration pattern.
   */
  success: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([10, 30, 10]);
      }
    }
  },

  /**
   * Triggers an error/warning vibration pattern.
   */
  error: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]);
      }
    }
  }
};
