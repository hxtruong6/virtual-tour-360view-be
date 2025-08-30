# Local File Storage Documentation

## Overview

The files module has been refactored to support local file storage on the server instead of Google Cloud Storage. This provides a simpler solution for file uploads and hosting.

## Environment Configuration

Add the following environment variable to your `.env` file:

```bash
# Server Storage Configuration
# Folder where uploaded files will be stored on the server
SERVER_STORAGE_FOLDER_NAME=./uploads
```

## API Endpoints

### 1. Upload Files

**POST** `/files/upload`

- **Description**: Upload multiple files to the server
- **Content-Type**: `multipart/form-data`
- **Authentication**: Public endpoint
- **Query Parameters**:
  - `isUrl` (optional, boolean): Whether to return file URLs in the response

**Request Body:**

```json
{
  "files": [
    {
      "file": "File data (binary)"
    }
  ]
}
```

**Response:**

```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "filePath": "2025-01-15/abc123.jpg",
      "url": "/api/v1/files/serve/2025-01-15/abc123.jpg" // Only if isUrl=true
    }
  ]
}
```

### 2. Get File URL

**GET** `/files/file-url?fileName={fileName}`

- **Description**: Get the URL for a specific file
- **Authentication**: Requires authentication

**Response:**

```json
{
  "url": "/api/v1/files/serve/2025-01-15/abc123.jpg"
}
```

### 3. Serve Files

**GET** `/api/v1/files/serve/{filePath}`

- **Description**: Serve uploaded files directly
- **Authentication**: Public endpoint
- **Example**: `GET /api/v1/files/serve/2025-01-15/abc123.jpg`

## File Organization

Files are organized by upload date in the following structure:

```
uploads/
├── 2025-01-15/
│   ├── abc123.jpg
│   ├── def456.pdf
│   └── ...
├── 2025-01-16/
│   └── ...
```

## Supported File Types

The following file types are supported:

- Images: PNG, JPEG, GIF, WebP, SVG
- Documents: PDF, Text files, JSON
- Office: Word, Excel, PowerPoint

## File Size Limits

- Maximum file size: 1GB
- Minimum file size: 100 bytes

## Implementation Details

### LocalStorageService

The `LocalStorageService` handles:

- File uploads to the local filesystem
- URL generation for file access
- File existence checks
- File deletion (if needed)

### FileService

The `FileService` handles:

- File name generation with unique IDs
- Multiple file upload processing
- Response formatting

### FilesController

The `FilesController` provides:

- Upload endpoint with validation
- File serving endpoint
- URL generation endpoint

## Security Considerations

1. Files are served with inline disposition by default
2. File paths are validated to prevent directory traversal
3. File existence is checked before serving
4. Upload directory is created with proper permissions

## Development Setup

1. Set the `SERVER_STORAGE_FOLDER_NAME` environment variable
2. Ensure the upload directory has write permissions
3. The application will automatically create the upload directory if it doesn't exist

## Migration from Google Cloud Storage

This implementation replaces the previous Google Cloud Storage integration with local file storage. Key differences:

- Files are stored locally instead of in GCS buckets
- URLs point to the local server instead of GCS URLs
- No external dependencies on Google Cloud services
- Simpler configuration and deployment

## Future Enhancements

Potential improvements for production use:

1. File compression for images
2. Virus scanning for uploaded files
3. File cleanup and archiving strategies
4. CDN integration for better performance
5. Backup strategies for uploaded files
