import { useRef } from "react";
import { ImageUploaderProps } from "../../types";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useMobileDetection } from "../../hooks/useMobileDetection";
import { ImagePreview } from "../ImagePreview";
import { MobileUploadButton } from "./MobileUploadButton";

export const ImageUploader = ({
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024,
  acceptedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  onUploadComplete,
  onUploadError,
  multiple = true,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isMobile, supportsCamera } = useMobileDetection();

  const {
    images,
    isDragging,
    isUploading,
    overallProgress,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
    clearAll,
    clearSuccessful,
    uploadImages,
    retryImage,
    retryAllFailed,
  } = useImageUpload({
    maxFiles,
    maxFileSize,
    acceptedTypes,
    onUploadComplete,
    onUploadError,
    multiple,
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasImages = images.length > 0;
  const hasPendingImages = images.some(
    (img) => img.status === "pending" || img.status === "retrying"
  );
  const hasFailedImages = images.some(
    (img) => img.status === "error" && img.retryable
  );
  const hasSuccessfulImages = images.some((img) => img.status === "success");
  const allUploaded =
    images.length > 0 &&
    images.every(
      (img) =>
        img.status === "success" || (img.status === "error" && !img.retryable)
    );

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          aria-label="File input"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700">
              {isDragging ? "Drop images here" : "Drag & drop images here"}
            </p>
            {!isMobile && (
              <p className="text-sm text-gray-500 mt-2">
                or{" "}
                <button
                  type="button"
                  onClick={handleClick}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  browse files
                </button>
              </p>
            )}
            {isMobile && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
                <MobileUploadButton
                  type="gallery"
                  onFileSelect={handleFileSelect}
                  acceptedTypes={acceptedTypes}
                  multiple={multiple}
                  disabled={isUploading}
                />
                {supportsCamera && (
                  <MobileUploadButton
                    type="camera"
                    onFileSelect={handleFileSelect}
                    acceptedTypes={acceptedTypes}
                    multiple={false}
                    disabled={isUploading}
                  />
                )}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Supported:{" "}
              {acceptedTypes
                .map((t) => t.split("/")[1])
                .join(", ")
                .toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      {isUploading && hasImages && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm text-gray-600">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {hasImages && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            {images.length} / {maxFiles} image{images.length !== 1 ? "s" : ""}{" "}
            selected
          </div>
          <div className="flex gap-3">
            {hasPendingImages && (
              <button
                onClick={uploadImages}
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isUploading ? "Uploading..." : "Upload All"}
              </button>
            )}
            {hasFailedImages && (
              <button
                onClick={retryAllFailed}
                disabled={isUploading}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Retry Failed
              </button>
            )}
            {hasSuccessfulImages && (
              <button
                onClick={clearSuccessful}
                disabled={isUploading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Clear Successful
              </button>
            )}
            <button
              onClick={clearAll}
              disabled={isUploading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {hasImages && (
        <div className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <ImagePreview
                key={image.id}
                image={image}
                onRemove={removeImage}
                onRetry={retryImage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {allUploaded && !hasPendingImages && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">
            All images have been processed!
          </p>
        </div>
      )}
    </div>
  );
};
