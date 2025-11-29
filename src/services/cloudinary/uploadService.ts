import { CloudinaryResponse } from "./types";
import {
  getCloudinaryUploadUrl,
  cloudinaryConfig,
  validateCloudinaryConfig,
} from "./config";

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Uploads a file to Cloudinary with progress tracking
 * @param file - The file to upload
 * @param onProgress - Optional progress callback (0-100)
 * @returns Promise that resolves with Cloudinary response
 */
export const uploadToCloudinary = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<CloudinaryResponse> => {
  // Validate configuration before attempting upload
  validateCloudinaryConfig();

  const uploadUrl = getCloudinaryUploadUrl();

  // Create FormData
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  // Use XMLHttpRequest for progress tracking
  return new Promise<CloudinaryResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        onProgress(percentage);
      }
    });

    // Handle successful upload
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: CloudinaryResponse = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(
            new Error(
              `Failed to parse Cloudinary response: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(
            new Error(
              errorResponse.error?.message ??
                `Upload failed with status ${xhr.status}`
            )
          );
        } catch {
          reject(
            new Error(
              `Upload failed with status ${xhr.status}: ${xhr.statusText}`
            )
          );
        }
      }
    });

    // Handle network errors
    xhr.addEventListener("error", () => {
      reject(new Error("Network error: Failed to upload file to Cloudinary"));
    });

    // Handle timeout
    xhr.addEventListener("timeout", () => {
      reject(new Error("Upload timeout: Request took too long"));
    });

    // Set timeout (5 minutes for large files)
    xhr.timeout = 5 * 60 * 1000;

    // Start upload
    xhr.open("POST", uploadUrl);
    xhr.send(formData);
  });
};

/**
 * Uploads a file with retry logic using exponential backoff
 * @param file - The file to upload
 * @param onProgress - Optional progress callback
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise that resolves with Cloudinary response
 */
export const uploadToCloudinaryWithRetry = async (
  file: File,

  onProgress?: UploadProgressCallback,
  maxRetries: number = 3
): Promise<CloudinaryResponse> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Reset progress on retry
      if (attempt > 0 && onProgress) {
        onProgress(0);
      }

      return await uploadToCloudinary(file, onProgress);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }
      const delay = Math.pow(2, attempt) * 1000;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error("Upload failed after retries");
};

/**
 * Validates if Cloudinary configuration is available
 * @returns true if configuration is valid
 */
export const isCloudinaryConfigured = (): boolean => {
  return (
    !!cloudinaryConfig.cloudName &&
    !!cloudinaryConfig.uploadPreset &&
    cloudinaryConfig.cloudName.trim() !== "" &&
    cloudinaryConfig.uploadPreset.trim() !== ""
  );
};
