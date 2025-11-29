import { useRef } from 'react';

interface MobileUploadButtonProps {
  onFileSelect: (files: FileList | null) => void;
  acceptedTypes: string[];
  multiple?: boolean;
  type: 'gallery' | 'camera';
  disabled?: boolean;
}

export const MobileUploadButton = ({
  onFileSelect,
  acceptedTypes,
  multiple = true,
  type,
  disabled = false,
}: MobileUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isCamera = type === 'camera';
  const buttonText = isCamera ? 'Take Photo' : 'Upload from Gallery';
  const icon = isCamera ? (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ) : (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        capture={isCamera ? 'environment' : undefined}
        aria-label={buttonText}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`
          flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium
          transition-all duration-200 min-h-[44px] min-w-[120px]
          ${
            isCamera
              ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-green-400 disabled:cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed'
          }
          shadow-md hover:shadow-lg active:shadow-md
          transform hover:scale-105 active:scale-95
        `}
      >
        {icon}
        <span>{buttonText}</span>
      </button>
    </>
  );
};

