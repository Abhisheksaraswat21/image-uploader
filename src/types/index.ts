export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "success" | "error" | "retrying";
  progress: number;
  error?: string;
  retryCount?: number;
  retryable?: boolean;
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  uploadedAt?: Date;
}

export interface ImageUploaderProps {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  onUploadComplete?: (images: UploadedImage[]) => void;
  onUploadError?: (error: Error) => void;
  multiple?: boolean;
}

export interface UseImageUploadReturn {
  images: UploadedImage[];
  isDragging: boolean;
  isUploading: boolean;
  overallProgress: number;
  handleFileSelect: (files: FileList | null) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  removeImage: (id: string) => void;
  clearAll: () => void;
  clearSuccessful: () => void;
  uploadImages: () => Promise<void>;
  retryImage: (id: string) => Promise<void>;
  retryAllFailed: () => Promise<void>;
}

export type ValidationResult = {
  valid: boolean;
  error?: string;
};
