import { CloudinaryConfig } from "./types";

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  return value ?? defaultValue ?? "";
};

export const cloudinaryConfig: CloudinaryConfig = {
  cloudName: getEnvVar("VITE_CLOUDINARY_CLOUD_NAME"),
  uploadPreset: getEnvVar("VITE_CLOUDINARY_UPLOAD_PRESET"),
  apiKey: getEnvVar("VITE_CLOUDINARY_API_KEY", undefined),
  apiSecret: getEnvVar("VITE_CLOUDINARY_API_SECRET", undefined),
  secure: true,
};

export const getCloudinaryUploadUrl = (): string => {
  if (!cloudinaryConfig.cloudName) {
    throw new Error("Cloudinary cloud name is not configured.");
  }
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
};

export const validateCloudinaryConfig = (): void => {
  if (!cloudinaryConfig.cloudName) {
    throw new Error("Cloudinary cloud name is not configured.");
  }

  if (!cloudinaryConfig.uploadPreset) {
    throw new Error("Cloudinary upload preset is not configured.");
  }
};
