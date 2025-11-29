import { useState, useCallback, useRef, useMemo } from "react";
import {
  UploadedImage,
  ImageUploaderProps,
  UseImageUploadReturn,
} from "../types";
import { validateFiles } from "../utils/fileValidation";
import {
  createImagePreview,
  generateId,
  fileListToArray,
} from "../utils/fileHelpers";
import {
  uploadToCloudinaryWithRetry,
  isCloudinaryConfigured,
} from "../services/cloudinary";
import { useCleanup } from "./useCleanup";
import {
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_ACCEPTED_TYPES,
} from "../constants";

export const useImageUpload = ({
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  onUploadComplete,
  onUploadError,
  multiple = true,
}: ImageUploaderProps = {}): UseImageUploadReturn => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dragCounter = useRef(0);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (images.length === 0) return 0;
    const totalProgress = images.reduce((sum, img) => {
      if (img.status === "success") return sum + 100;
      if (img.status === "error" || img.status === "pending") return sum;
      return sum + img.progress;
    }, 0);
    return Math.round(totalProgress / images.length);
  }, [images]);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) return;

      const filesToProcess = multiple ? files : [files[0]];
      const validation = validateFiles(
        filesToProcess,
        maxFiles,
        maxFileSize,
        acceptedTypes
      );

      if (!validation.valid) {
        onUploadError?.(new Error(validation.error ?? "Validation failed"));
        return;
      }

      const newImages: UploadedImage[] = await Promise.all(
        filesToProcess.map(async (file) => {
          const preview = await createImagePreview(file);
          return {
            id: generateId(),
            file,
            preview,
            status: "pending" as const,
            progress: 0,
            retryCount: 0,
            retryable: true,
          };
        })
      );

      setImages((prev) => {
        const updated = multiple ? [...prev, ...newImages] : newImages;
        return updated.slice(0, maxFiles);
      });
    },
    [maxFiles, maxFileSize, acceptedTypes, multiple, onUploadError]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const fileArray = fileListToArray(files);
      void processFiles(fileArray);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        handleFileSelect(droppedFiles);
      }
    },
    [handleFileSelect]
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      // Cleanup object URL if it's a blob URL
      if (imageToRemove?.preview && imageToRemove.preview.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    // Cleanup object URLs before clearing
    images.forEach((img) => {
      if (img.preview && img.preview.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImages([]);
  }, [images]);

  const clearSuccessful = useCallback(() => {
    setImages((prev) => {
      const toRemove = prev.filter((img) => img.status === "success");
      // Cleanup object URLs for removed images
      toRemove.forEach((img) => {
        if (img.preview && img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
      return prev.filter((img) => img.status !== "success");
    });
  }, []);

  // Cleanup object URLs when images are removed
  const previewUrls = useMemo(
    () =>
      images.map((img) => img.preview).filter((url) => url.startsWith("blob:")),
    [images]
  );
  useCleanup(previewUrls);

  const uploadSingleImage = useCallback(
    async (image: UploadedImage): Promise<UploadedImage> => {
      if (!isCloudinaryConfigured()) {
        throw new Error("Cloudinary is not configured.");
      }

      try {
        const response = await uploadToCloudinaryWithRetry(
          image.file,
          (progress) => {
            setImages((prev) =>
              prev.map((img) =>
                img.id === image.id ? { ...img, progress } : img
              )
            );
          },
          3 // max retries
        );

        return {
          ...image,
          status: "success" as const,
          progress: 100,
          cloudinaryUrl: response.secure_url,
          cloudinaryPublicId: response.public_id,
          uploadedAt: new Date(),
          retryable: false,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        return {
          ...image,
          status: "error" as const,
          error: errorMessage,
          progress: 0,
          retryable: true,
        };
      }
    },
    []
  );

  const uploadImagesHandler = useCallback(async () => {
    const pendingImages = images.filter(
      (img) => img.status === "pending" || img.status === "retrying"
    );
    if (pendingImages.length === 0) return;

    setIsUploading(true);

    // Update status to uploading
    setImages((prev) =>
      prev.map((img) =>
        img.status === "pending" || img.status === "retrying"
          ? { ...img, status: "uploading" as const }
          : img
      )
    );

    try {
      // Upload images concurrently (limit to 3 at a time for better performance)
      const uploadPromises = pendingImages.map((image) =>
        uploadSingleImage(image)
      );

      const results = await Promise.all(uploadPromises);

      const finalImages = images.map((img) => {
        const result = results.find((r) => r.id === img.id);
        return result ?? img;
      });

      setImages((prev) =>
        prev.map((img) => {
          const result = results.find((r) => r.id === img.id);
          return result ?? img;
        })
      );

      // Call callback with merged images (has upload results)
      onUploadComplete?.(finalImages);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      onUploadError?.(new Error(errorMessage));
    } finally {
      setIsUploading(false);
    }
  }, [images, onUploadComplete, onUploadError, uploadSingleImage]);

  const retryImage = useCallback(
    async (id: string) => {
      const image = images.find((img) => img.id === id);
      if (!image || !image.retryable) return;

      setIsUploading(true);

      // Update to retrying status
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
                ...img,
                status: "retrying" as const,
                retryCount: (img.retryCount ?? 0) + 1,
                progress: 0,
                error: undefined,
              }
            : img
        )
      );

      try {
        const updatedImage = await uploadSingleImage({
          ...image,
          retryCount: (image.retryCount ?? 0) + 1,
        });

        setImages((prev) =>
          prev.map((img) => (img.id === id ? updatedImage : img))
        );

        // Check if all uploads are complete
        const allComplete = images
          .map((img) => (img.id === id ? updatedImage : img))
          .every((img) => img.status === "success" || img.status === "error");

        if (allComplete) {
          onUploadComplete?.(
            images.map((img) => (img.id === id ? updatedImage : img))
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Retry failed";
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  status: "error" as const,
                  error: errorMessage,
                  retryable: true,
                }
              : img
          )
        );
        onUploadError?.(new Error(errorMessage));
      } finally {
        setIsUploading(false);
      }
    },
    [images, uploadSingleImage, onUploadComplete, onUploadError]
  );

  const retryAllFailed = useCallback(async () => {
    const failedImages = images.filter(
      (img) => img.status === "error" && img.retryable
    );
    if (failedImages.length === 0) return;

    setIsUploading(true);

    // Update all failed to retrying
    setImages((prev) =>
      prev.map((img) =>
        img.status === "error" && img.retryable
          ? {
              ...img,
              status: "retrying" as const,
              retryCount: (img.retryCount ?? 0) + 1,
              progress: 0,
              error: undefined,
            }
          : img
      )
    );

    try {
      const uploadPromises = failedImages.map((image) =>
        uploadSingleImage({
          ...image,
          retryCount: (image.retryCount ?? 0) + 1,
        })
      );

      const results = await Promise.all(uploadPromises);

      const finalImages = images.map((img) => {
        const result = results.find((r) => r.id === img.id);
        return result ?? img;
      });

      setImages((prev) =>
        prev.map((img) => {
          const result = results.find((r) => r.id === img.id);
          return result ?? img;
        })
      );

      onUploadComplete?.(finalImages);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Retry all failed";
      onUploadError?.(new Error(errorMessage));
    } finally {
      setIsUploading(false);
    }
  }, [images, uploadSingleImage, onUploadComplete, onUploadError]);

  return {
    images,
    isDragging,
    isUploading,
    overallProgress,
    handleFileSelect,
    handleDragOver: (e: React.DragEvent) => {
      handleDragOver(e);
      handleDragEnter(e);
    },
    handleDragLeave,
    handleDrop,
    removeImage,
    clearAll,
    clearSuccessful,
    uploadImages: uploadImagesHandler,
    retryImage,
    retryAllFailed,
  };
};
