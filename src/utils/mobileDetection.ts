/**
 * Detects if the current device is a mobile device
 * @returns true if mobile device is detected
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check user agent
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod/i;

  if (mobileRegex.test(userAgent)) {
    return true;
  }

  // Check screen width (fallback for desktop browsers in mobile mode)
  if (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) {
    return true;
  }

  // Check for touch support
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    // Additional check: if touch but large screen, might be a tablet
    const isLargeScreen = window.innerWidth >= 1024;
    return !isLargeScreen;
  }

  return false;
};

/**
 * Detects if the current device is iOS
 * @returns true if iOS device is detected
 */
export const isIOS = (): boolean => {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Detects if the current device is Android
 * @returns true if Android device is detected
 */
export const isAndroid = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android/.test(navigator.userAgent);
};

/**
 * Detects if the device supports camera capture
 * @returns true if camera is available
 */
export const supportsCameraCapture = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check if getUsermedia is available
  const nav = navigator as any;
  const hasGetUserMedia =
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
    !!(
      nav.getUserMedia ||
      nav.webkitGetUserMedia ||
      nav.mozGetUserMedia ||
      nav.msGetUserMedia
    );

  return hasGetUserMedia && isMobileDevice();
};

/**
 * Detects if the device supports file input with capture attribute
 * @returns true if capture is supported
 */
export const supportsFileCapture = (): boolean => {
  if (typeof window === "undefined") return false;
  return isMobileDevice();
};
