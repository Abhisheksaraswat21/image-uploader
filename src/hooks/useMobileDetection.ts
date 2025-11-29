import { useState, useEffect } from "react";
import {
  isMobileDevice,
  isIOS,
  isAndroid,
  supportsCameraCapture,
  supportsFileCapture,
} from "../utils/mobileDetection";

export interface MobileDetectionResult {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsCamera: boolean;
  supportsFileCapture: boolean;
}

export const useMobileDetection = (): MobileDetectionResult => {
  const [detection, setDetection] = useState<MobileDetectionResult>(() => ({
    isMobile: isMobileDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    supportsCamera: supportsCameraCapture(),
    supportsFileCapture: supportsFileCapture(),
  }));

  useEffect(() => {
    const updateDetection = () => {
      setDetection({
        isMobile: isMobileDevice(),
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        supportsCamera: supportsCameraCapture(),
        supportsFileCapture: supportsFileCapture(),
      });
    };

    updateDetection();

    window.addEventListener("resize", updateDetection);

    window.addEventListener("orientationchange", updateDetection);

    return () => {
      window.removeEventListener("resize", updateDetection);
      window.removeEventListener("orientationchange", updateDetection);
    };
  }, []);

  return detection;
};
