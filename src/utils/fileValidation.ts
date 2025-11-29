import { ValidationResult } from "../types";
import { DEFAULT_MAX_FILE_SIZE, DEFAULT_ACCEPTED_TYPES } from "../constants";

export const validateFile = (
  file: File | null,
  maxSize: number = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes: string[] = DEFAULT_ACCEPTED_TYPES
): ValidationResult => {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${
        file.type
      } is not supported. Accepted types: ${acceptedTypes.join(", ")}`,
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

export const validateFiles = (
  files: File[],
  maxFiles: number,
  maxSize: number = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes: string[] = DEFAULT_ACCEPTED_TYPES
): ValidationResult => {
  if (files.length === 0) {
    return { valid: false, error: "No files provided" };
  }

  if (files.length > maxFiles) {
    return {
      valid: false,
      error: `Maximum ${maxFiles} file(s) allowed. You selected ${files.length} file(s).`,
    };
  }

  for (const file of files) {
    const validation = validateFile(file, maxSize, acceptedTypes);
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
};
