/**
 * Mobile Native Hardware Utilities (Vibration Haptics, WakeLock, and Fullscreen)
 */

let wakeLockSentinel: any = null;

export const MobileHaptics = {
  /**
   * Triggers native phone vibration feedback
   */
  vibrate(pattern: number | number[] = 40): boolean {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        return navigator.vibrate(pattern);
      } catch {
        return false;
      }
    }
    return false;
  },

  tapLight() {
    this.vibrate(25);
  },

  tapMedium() {
    this.vibrate(45);
  },

  success() {
    this.vibrate([30, 40, 60]);
  },

  warning() {
    this.vibrate([60, 50, 60]);
  },

  error() {
    this.vibrate([100, 60, 100]);
  },

  /**
   * Keeps phone display awake during CBT practice sessions
   */
  async requestWakeLock(): Promise<boolean> {
    if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
      try {
        wakeLockSentinel = await (navigator as any).wakeLock.request("screen");
        wakeLockSentinel.addEventListener("release", () => {
          wakeLockSentinel = null;
        });
        return true;
      } catch (err) {
        console.warn("WakeLock error:", err);
        return false;
      }
    }
    return false;
  },

  releaseWakeLock() {
    if (wakeLockSentinel) {
      try {
        wakeLockSentinel.release();
        wakeLockSentinel = null;
      } catch {
        // ignore
      }
    }
  },

  isWakeLockActive(): boolean {
    return !!wakeLockSentinel;
  },

  /**
   * Request Android Fullscreen Immersive Mode
   */
  async toggleFullscreen(): Promise<boolean> {
    if (typeof document === "undefined") return false;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return true;
      } else {
        await document.exitFullscreen();
        return false;
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
      return false;
    }
  },

  isFullscreenActive(): boolean {
    return typeof document !== "undefined" && !!document.fullscreenElement;
  }
};
