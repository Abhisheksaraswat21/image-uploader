import { useEffect, useRef } from "react";
import { revokeObjectURL } from "../utils/memoryManager";

/**
 * Hook to automatically clean up object URLs on unmount
 * @param urls - Array of object URLs to clean up
 */
export const useCleanup = (urls: string[]): void => {
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      urlsRef.current.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          revokeObjectURL(url);
        }
      });
    };
  }, []);
};




