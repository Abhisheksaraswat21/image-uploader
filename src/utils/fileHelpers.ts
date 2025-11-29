export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${
    sizes[i] ?? "Bytes"
  }`;
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        resolve(e.target.result);
      } else {
        reject(new Error("Failed to create image preview"));
      }
    };
    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsDataURL(file);
  });
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const fileListToArray = (fileList: FileList | null): File[] => {
  if (!fileList) return [];
  return Array.from(fileList);
};
