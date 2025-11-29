import { ImageUploader } from "./components/ImageUploader";

function App() {
  const handleUploadComplete = (
    images: Array<{
      id: string;
      file: File;
      preview: string;
      status: string;
      progress: number;
    }>
  ) => {
    console.log("Upload complete:", images);
    // Handle successful uploads - e.g., send to API, update state, etc.
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    // Handle upload errors - e.g., show notification, log to error service, etc.
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Image Uploader
          </h1>
          <p className="text-gray-600">
            Upload, preview, and manage your images with ease
          </p>
        </header>

        <ImageUploader
          maxFiles={10}
          maxFileSize={5 * 1024 * 1024} // 5MB
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          multiple={true}
        />
      </div>
    </div>
  );
}

export default App;
