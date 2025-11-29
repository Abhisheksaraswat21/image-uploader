import { memo, useState } from "react";
import { UploadedImage } from "../../types";
import { formatFileSize } from "../../utils/fileHelpers";
import { ImagePreviewModal } from "./ImagePreviewModal";

interface ImagePreviewProps {
  image: UploadedImage;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
}

export const ImagePreview = memo(
  ({ image, onRemove, onRetry }: ImagePreviewProps) => {
    const [showModal, setShowModal] = useState(false);

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent opening modal when clicking remove
      if (image.status !== "uploading" && image.status !== "retrying") {
        onRemove(image.id);
      }
    };

    const handleRetry = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent opening modal when clicking retry
      if (onRetry && image.retryable && image.status === "error") {
        onRetry(image.id);
      }
    };

    const handleImageClick = () => {
      // Only open modal if not uploading/retrying
      if (image.status !== "uploading" && image.status !== "retrying") {
        setShowModal(true);
      }
    };

    return (
      <>
        <div className="relative group bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
          <div
            className="aspect-square relative cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src={image.preview}
              alt={image.file.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Remove button - top right corner */}
            <button
              onClick={handleRemove}
              disabled={
                image.status === "uploading" || image.status === "retrying"
              }
              className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              aria-label={`Remove ${image.file.name}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Status overlay */}
            {(image.status === "uploading" || image.status === "retrying") && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm font-medium">
                    {Math.round(image.progress)}%
                  </p>
                  {image.status === "retrying" &&
                    image.retryCount &&
                    image.retryCount > 0 && (
                      <p className="text-xs mt-1 opacity-75">
                        Retry {image.retryCount}
                      </p>
                    )}
                </div>
              </div>
            )}

            {image.status === "error" && (
              <div className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center">
                <div className="text-white text-center p-2">
                  <p className="text-sm font-medium">Upload Failed</p>
                  {image.error && (
                    <p className="text-xs mt-1 opacity-90">{image.error}</p>
                  )}
                  {onRetry && image.retryable && (
                    <button
                      onClick={handleRetry}
                      className="mt-3 px-4 py-1.5 bg-white text-red-600 rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {image.status === "success" && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* File info */}
          <div className="p-3">
            <p
              className="text-sm font-medium text-gray-800 truncate"
              title={image.file.name}
            >
              {image.file.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatFileSize(image.file.size)}
            </p>
          </div>
        </div>

        {/* Preview Modal */}
        {showModal && (
          <ImagePreviewModal
            imageUrl={image.cloudinaryUrl || image.preview}
            fileName={image.file.name}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }
);

ImagePreview.displayName = "ImagePreview";
