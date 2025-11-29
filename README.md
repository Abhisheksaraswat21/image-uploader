# Image Uploader

A modern, production-ready image uploader built with React, TypeScript, Vite, and Tailwind CSS. Upload images with drag & drop, file selection, or mobile camera capture, with real-time progress tracking and Cloudinary integration.

## ✨ Features

- 🖼️ **Multiple Upload Methods**: Drag & drop, file browser, mobile camera, and gallery
- 📊 **Real-time Progress**: Track upload progress for each image
- 🔄 **Retry Mechanism**: Automatic retry with exponential backoff
- ✅ **File Validation**: Type and size validation before upload
- 📱 **Mobile Optimized**: Native camera capture and responsive design
- 🎨 **Modern UI**: Clean, accessible interface with Tailwind CSS
- 🔒 **Type Safe**: Full TypeScript coverage
- ⚡ **Performance**: Optimized with memoization and lazy loading

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Cloudinary account (free tier available)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd image-uploader

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Cloudinary credentials
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**Getting Cloudinary Credentials:**

1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Get your `cloud_name` from the dashboard
3. Create an upload preset:
   - Go to **Settings → Upload → Add upload preset**
   - Set to **"Unsigned"**
   - Configure allowed formats and max file size
   - Save the preset name

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage

### Basic Example

```tsx
import { ImageUploader } from "./components/ImageUploader";

function App() {
  return (
    <ImageUploader
      maxFiles={10}
      maxFileSize={5 * 1024 * 1024} // 5MB
      multiple={true}
    />
  );
}
```

### With Callbacks

```tsx
<ImageUploader
  maxFiles={10}
  maxFileSize={5 * 1024 * 1024}
  acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
  onUploadComplete={(images) => {
    // Handle successful uploads
    console.log("Uploaded images:", images);
    // images array contains: id, cloudinaryUrl, cloudinaryPublicId, etc.
  }}
  onUploadError={(error) => {
    // Handle errors
    console.error("Upload error:", error);
  }}
  multiple={true}
/>
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ImageUploader/  # Main upload component
│   └── ImagePreview/   # Image preview cards
├── hooks/              # Custom React hooks
│   ├── useImageUpload.ts
│   ├── useMobileDetection.ts
│   └── useCleanup.ts
├── services/           # External services
│   └── cloudinary/     # Cloudinary integration
├── utils/              # Utility functions
│   ├── fileValidation.ts
│   ├── fileHelpers.ts
│   ├── memoryManager.ts
│   └── mobileDetection.ts
├── types/              # TypeScript definitions
├── constants/          # App constants
└── App.tsx             # Root component
```

## ⚙️ Configuration

### Props

| Prop               | Type                                | Default                                                               | Description                    |
| ------------------ | ----------------------------------- | --------------------------------------------------------------------- | ------------------------------ |
| `maxFiles`         | `number`                            | `10`                                                                  | Maximum number of files        |
| `maxFileSize`      | `number`                            | `5242880`                                                             | Max file size in bytes (5MB)   |
| `acceptedTypes`    | `string[]`                          | `['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']` | Accepted MIME types            |
| `multiple`         | `boolean`                           | `true`                                                                | Allow multiple file selection  |
| `onUploadComplete` | `(images: UploadedImage[]) => void` | -                                                                     | Callback when upload completes |
| `onUploadError`    | `(error: Error) => void`            | -                                                                     | Callback when upload fails     |

### UploadedImage Type

```typescript
interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "success" | "error" | "retrying";
  progress: number;
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  error?: string;
  retryable?: boolean;
  retryCount?: number;
  uploadedAt?: Date;
}
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Cloudinary** - Image hosting
- **ESLint** - Code quality

## 📱 Mobile Features

- Native camera capture via HTML5 `capture` attribute
- Gallery selection
- Touch-optimized UI
- Responsive design

## 🔧 Development

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```
