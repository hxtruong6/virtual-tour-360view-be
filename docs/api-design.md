# Virtual Tour Platform API Design

This document outlines the comprehensive REST API design for the Virtual Tour Platform, designed following RESTful principles and NestJS best practices.

## Base URL Structure

```
Production: https://api.virtualtours.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication

### API Authentication Types

1. **JWT Token Authentication** (For web/mobile apps)
   - Header: `Authorization: Bearer <jwt_token>`
   - Used for user sessions and admin panel

2. **API Key Authentication** (For third-party integrations)
   - Header: `X-API-Key: <api_key>`
   - Used for external applications and embeds

3. **Public Access** (For public tours)
   - No authentication required for published tours

## API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8,
      "has_previous": false,
      "has_next": true
    }
  }
}
```

---

## 1. Authentication & Authorization APIs

### 1.1 User Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "language": "en"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "role": "VIEWER",
      "status": "PENDING_VERIFICATION"
    },
    "message": "Registration successful. Please check your email for verification."
  }
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here",
    "expires_in": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "VIEWER",
      "status": "ACTIVE"
    }
  }
}
```

#### Verify Email

```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_here"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh_token_here"
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

#### Reset Password Request

```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password Confirm

```http
POST /auth/reset-password/confirm
Content-Type: application/json

{
  "token": "reset_token_here",
  "new_password": "newSecurePassword123"
}
```

### 1.2 User Profile Management

#### Get Current User Profile

```http
GET /auth/profile
Authorization: Bearer <jwt_token>
```

#### Update User Profile

```http
PATCH /auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "language": "en",
  "timezone": "UTC"
}
```

#### Change Password

```http
POST /auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "current_password": "currentPassword123",
  "new_password": "newPassword123"
}
```

---

## 2. Virtual Tours API

### 2.1 Public Tour Access

#### Get Published Tours (Public)

```http
GET /tours/public?page=1&limit=20&category=real-estate&search=apartment&sort_by=created_at&sort_order=desc
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `category` (string): Filter by category
- `search` (string): Search in title/description
- `tags` (array): Filter by tags
- `difficulty` (enum): BEGINNER, INTERMEDIATE, ADVANCED
- `sort_by` (enum): created_at, updated_at, title, view_count, average_rating
- `sort_order` (enum): asc, desc

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "tour_123",
        "title": "Modern Apartment Tour",
        "description": "Beautiful 2-bedroom apartment...",
        "location": "New York, NY",
        "slug": "modern-apartment-tour",
        "status": "PUBLISHED",
        "difficulty": "BEGINNER",
        "category": "real-estate",
        "tags": ["apartment", "modern", "luxury"],
        "thumbnail_url": "https://cdn.example.com/thumb.jpg",
        "view_count": 1250,
        "average_rating": 4.8,
        "total_ratings": 25,
        "total_scenes": 8,
        "total_hotspots": 15,
        "estimated_duration": 12,
        "created_at": "2024-01-10T10:00:00Z",
        "created_by": {
          "id": "user_456",
          "username": "property_agent",
          "first_name": "Jane",
          "last_name": "Smith"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "total_pages": 8,
      "has_previous": false,
      "has_next": true
    }
  }
}
```

#### Get Tour by Slug (Public)

```http
GET /tours/public/{slug}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "tour_123",
    "title": "Modern Apartment Tour",
    "description": "Beautiful 2-bedroom apartment in downtown...",
    "location": "New York, NY",
    "slug": "modern-apartment-tour",
    "status": "PUBLISHED",
    "difficulty": "BEGINNER",
    "category": "real-estate",
    "tags": ["apartment", "modern", "luxury"],
    "thumbnail_url": "https://cdn.example.com/thumb.jpg",
    "meta_title": "Modern Apartment Virtual Tour | Real Estate",
    "meta_description": "Experience this beautiful modern apartment...",
    "allow_public_access": true,
    "autoplay_enabled": false,
    "autoplay_speed": 2,
    "view_count": 1250,
    "average_rating": 4.8,
    "total_ratings": 25,
    "total_scenes": 8,
    "total_hotspots": 15,
    "estimated_duration": 12,
    "created_at": "2024-01-10T10:00:00Z",
    "published_at": "2024-01-10T14:00:00Z",
    "created_by": {
      "id": "user_456",
      "username": "property_agent",
      "first_name": "Jane",
      "last_name": "Smith"
    },
    "scenes": [
      {
        "id": "scene_789",
        "title": "Living Room",
        "description": "Spacious living room with modern furniture",
        "order": 1,
        "panorama_url": "https://cdn.example.com/panorama1.jpg",
        "thumbnail_url": "https://cdn.example.com/scene1_thumb.jpg",
        "initial_view_angle": 0,
        "max_zoom": 3,
        "min_zoom": 0.5,
        "hotspots": [
          {
            "id": "hotspot_101",
            "type": "NAVIGATION",
            "title": "Go to Kitchen",
            "description": "Navigate to the modern kitchen",
            "position_x": 0.5,
            "position_y": 0.3,
            "position_z": -0.8,
            "icon_url": "https://cdn.example.com/arrow_icon.png",
            "icon_color": "#ffffff",
            "icon_size": 1.0,
            "target_scene_id": "scene_790",
            "animation_type": "pulse",
            "animation_speed": 1.0
          },
          {
            "id": "hotspot_102",
            "type": "INFO",
            "title": "Living Room Info",
            "description": "Learn about this space",
            "position_x": -0.2,
            "position_y": 0.1,
            "position_z": 0.9,
            "content": {
              "text": "This spacious living room features 12-foot ceilings...",
              "image": "https://cdn.example.com/living_room_detail.jpg"
            }
          }
        ]
      }
    ]
  }
}
```

### 2.2 Authenticated Tour Management

#### Get User's Tours

```http
GET /tours?page=1&limit=20&status=PUBLISHED
Authorization: Bearer <jwt_token>
```

#### Create Tour

```http
POST /tours
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My New Tour",
  "description": "Description of the tour",
  "location": "San Francisco, CA",
  "category": "real-estate",
  "tags": ["apartment", "modern"],
  "difficulty": "BEGINNER",
  "allow_public_access": true,
  "allow_embedding": true,
  "autoplay_enabled": false,
  "autoplay_speed": 2,
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "meta_keywords": ["virtual tour", "real estate"]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "tour_new123",
    "title": "My New Tour",
    "slug": "my-new-tour",
    "status": "DRAFT",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Tour

```http
PATCH /tours/{tourId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Tour Title",
  "description": "Updated description",
  "status": "PUBLISHED"
}
```

#### Delete Tour

```http
DELETE /tours/{tourId}
Authorization: Bearer <jwt_token>
```

#### Upload Tour Thumbnail

```http
POST /tours/{tourId}/thumbnail
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

thumbnail: <file>
```

---

## 3. Scenes API

### 3.1 Scene Management

#### Get Tour Scenes

```http
GET /tours/{tourId}/scenes
Authorization: Bearer <jwt_token>
```

#### Create Scene

```http
POST /tours/{tourId}/scenes
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Kitchen Scene",
  "description": "Modern kitchen with island",
  "order": 2,
  "initial_view_angle": 45,
  "max_zoom": 3,
  "min_zoom": 0.5,
  "map_position_x": 100,
  "map_position_y": 150
}
```

#### Update Scene

```http
PATCH /tours/{tourId}/scenes/{sceneId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Scene Title",
  "order": 3
}
```

#### Delete Scene

```http
DELETE /tours/{tourId}/scenes/{sceneId}
Authorization: Bearer <jwt_token>
```

#### Upload Scene Panorama

```http
POST /tours/{tourId}/scenes/{sceneId}/panorama
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

panorama: <file>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "panorama_url": "https://cdn.example.com/panorama_123.jpg",
    "thumbnail_url": "https://cdn.example.com/thumbnail_123.jpg",
    "processing_status": "PROCESSING"
  }
}
```

#### Bulk Upload Scenes

```http
POST /tours/{tourId}/scenes/bulk
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

scenes: <file[]>
metadata: {
  "scenes": [
    {
      "title": "Living Room",
      "description": "Main living area",
      "order": 1
    },
    {
      "title": "Kitchen",
      "description": "Modern kitchen",
      "order": 2
    }
  ]
}
```

---

## 4. Hotspots API

### 4.1 Hotspot Management

#### Get Scene Hotspots

```http
GET /tours/{tourId}/scenes/{sceneId}/hotspots
Authorization: Bearer <jwt_token>
```

#### Create Hotspot

```http
POST /tours/{tourId}/scenes/{sceneId}/hotspots
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "NAVIGATION",
  "title": "Go to Bedroom",
  "description": "Navigate to the master bedroom",
  "position_x": 0.5,
  "position_y": 0.2,
  "position_z": -0.8,
  "target_scene_id": "scene_456",
  "icon_color": "#ffffff",
  "icon_size": 1.2,
  "animation_type": "pulse",
  "animation_speed": 1.0
}
```

#### Create Info Hotspot

```http
POST /tours/{tourId}/scenes/{sceneId}/hotspots
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "INFO",
  "title": "Kitchen Features",
  "description": "Learn about kitchen amenities",
  "position_x": -0.3,
  "position_y": 0.1,
  "position_z": 0.9,
  "content": {
    "text": "This kitchen features granite countertops, stainless steel appliances, and custom cabinetry.",
    "image": "https://cdn.example.com/kitchen_detail.jpg",
    "video": "https://cdn.example.com/kitchen_tour.mp4"
  }
}
```

#### Update Hotspot

```http
PATCH /tours/{tourId}/scenes/{sceneId}/hotspots/{hotspotId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Hotspot Title",
  "position_x": 0.6
}
```

#### Delete Hotspot

```http
DELETE /tours/{tourId}/scenes/{sceneId}/hotspots/{hotspotId}
Authorization: Bearer <jwt_token>
```

---

## 5. Media Management API

### 5.1 File Upload

#### Upload Media File

```http
POST /media/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <file>
media_type: "IMAGE"
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "media_123",
    "original_name": "kitchen_photo.jpg",
    "file_name": "media_123_kitchen_photo.jpg",
    "file_path": "/uploads/2024/01/media_123_kitchen_photo.jpg",
    "file_size": 2048576,
    "mime_type": "image/jpeg",
    "media_type": "IMAGE",
    "status": "PROCESSING",
    "width": 4000,
    "height": 3000,
    "thumbnail_path": "/uploads/2024/01/thumbnails/media_123_thumb.jpg",
    "external_url": "https://cdn.example.com/media_123_kitchen_photo.jpg"
  }
}
```

#### Get Media File

```http
GET /media/{mediaId}
Authorization: Bearer <jwt_token>
```

#### Delete Media File

```http
DELETE /media/{mediaId}
Authorization: Bearer <jwt_token>
```

#### Get User Media Files

```http
GET /media?page=1&limit=20&media_type=IMAGE&status=READY
Authorization: Bearer <jwt_token>
```

---

## 6. User Engagement API

### 6.1 Bookmarks

#### Bookmark Tour

```http
POST /tours/{tourId}/bookmark
Authorization: Bearer <jwt_token>
```

#### Remove Bookmark

```http
DELETE /tours/{tourId}/bookmark
Authorization: Bearer <jwt_token>
```

#### Get User Bookmarks

```http
GET /bookmarks?page=1&limit=20
Authorization: Bearer <jwt_token>
```

### 6.2 Ratings

#### Rate Tour

```http
POST /tours/{tourId}/rating
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Amazing virtual tour! Very detailed and immersive."
}
```

#### Update Rating

```http
PATCH /tours/{tourId}/rating
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "rating": 4,
  "review": "Updated review text"
}
```

#### Get Tour Ratings

```http
GET /tours/{tourId}/ratings?page=1&limit=20
```

---

## 7. Analytics API

### 7.1 Tour Analytics

#### Get Tour Analytics

```http
GET /tours/{tourId}/analytics?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_views": 1250,
    "unique_visitors": 892,
    "avg_view_duration": 8.5,
    "top_scenes": [
      {
        "scene_id": "scene_789",
        "title": "Living Room",
        "views": 1100
      },
      {
        "scene_id": "scene_790", 
        "title": "Kitchen",
        "views": 950
      }
    ],
    "hotspot_interactions": [
      {
        "hotspot_id": "hotspot_101",
        "title": "Go to Kitchen",
        "clicks": 750
      }
    ],
    "views_by_date": [
      {
        "date": "2024-01-01",
        "views": 45
      },
      {
        "date": "2024-01-02",
        "views": 52
      }
    ],
    "device_breakdown": {
      "desktop": 65,
      "mobile": 30,
      "tablet": 5
    },
    "geographic_data": {
      "countries": [
        {
          "country": "United States",
          "views": 800
        },
        {
          "country": "Canada",
          "views": 250
        }
      ]
    }
  }
}
```

#### Track Tour View

```http
POST /tours/{tourId}/view
Content-Type: application/json

{
  "session_token": "session_123",
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1"
}
```

#### Track Scene View

```http
POST /tours/{tourId}/scenes/{sceneId}/view
Content-Type: application/json

{
  "session_token": "session_123",
  "duration": 15.5
}
```

#### Track Hotspot Click

```http
POST /tours/{tourId}/scenes/{sceneId}/hotspots/{hotspotId}/click
Content-Type: application/json

{
  "session_token": "session_123"
}
```

---

## 8. Internationalization API

### 8.1 Tour Translations

#### Get Tour Translations

```http
GET /tours/{tourId}/translations
Authorization: Bearer <jwt_token>
```

#### Create/Update Tour Translation

```http
PUT /tours/{tourId}/translations/{language}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Visite Virtuelle d'Appartement Moderne",
  "description": "Magnifique appartement de 2 chambres...",
  "meta_title": "Visite Virtuelle | Immobilier",
  "meta_description": "Découvrez ce magnifique appartement..."
}
```

#### Delete Tour Translation

```http
DELETE /tours/{tourId}/translations/{language}
Authorization: Bearer <jwt_token>
```

### 8.2 Scene Translations

#### Create/Update Scene Translation

```http
PUT /tours/{tourId}/scenes/{sceneId}/translations/{language}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Salon",
  "description": "Salon spacieux avec mobilier moderne"
}
```

### 8.3 Hotspot Translations

#### Create/Update Hotspot Translation

```http
PUT /tours/{tourId}/scenes/{sceneId}/hotspots/{hotspotId}/translations/{language}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Aller à la Cuisine",
  "description": "Naviguez vers la cuisine moderne",
  "content": {
    "text": "Cette cuisine moderne dispose de...",
    "image": "https://cdn.example.com/kitchen_detail_fr.jpg"
  }
}
```

---

## 9. Embedding API

### 9.1 Tour Embedding

#### Create Embed Token

```http
POST /tours/{tourId}/embed
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "domain": "example.com",
  "width": "100%",
  "height": "600px",
  "show_controls": true,
  "show_branding": true,
  "autoplay": false
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "embed_token": "embed_abc123",
    "embed_url": "https://embed.virtualtours.com/tour/embed_abc123",
    "iframe_code": "<iframe src=\"https://embed.virtualtours.com/tour/embed_abc123\" width=\"100%\" height=\"600px\" frameborder=\"0\"></iframe>"
  }
}
```

#### Get Embed Analytics

```http
GET /tours/{tourId}/embed/{embedToken}/analytics
Authorization: Bearer <jwt_token>
```

#### Update Embed Settings

```http
PATCH /tours/{tourId}/embed/{embedToken}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "show_controls": false,
  "autoplay": true
}
```

#### Delete Embed

```http
DELETE /tours/{tourId}/embed/{embedToken}
Authorization: Bearer <jwt_token>
```

---

## 10. API Keys Management

### 10.1 API Key Operations

#### Create API Key

```http
POST /api-keys
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "My App Integration",
  "allow_read": true,
  "allow_write": false,
  "allow_analytics": true,
  "requests_per_day": 5000,
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "apikey_123",
    "name": "My App Integration",
    "api_key": "vt_live_abc123def456...",
    "allow_read": true,
    "allow_write": false,
    "allow_analytics": true,
    "requests_per_day": 5000,
    "expires_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Get API Keys

```http
GET /api-keys
Authorization: Bearer <jwt_token>
```

#### Update API Key

```http
PATCH /api-keys/{keyId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated API Key Name",
  "requests_per_day": 10000
}
```

#### Revoke API Key

```http
DELETE /api-keys/{keyId}
Authorization: Bearer <jwt_token>
```

#### Get API Key Usage

```http
GET /api-keys/{keyId}/usage?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <jwt_token>
```

---

## 11. Admin APIs

### 11.1 User Management (Admin Only)

#### Get All Users

```http
GET /admin/users?page=1&limit=20&role=VIEWER&status=ACTIVE
Authorization: Bearer <admin_jwt_token>
```

#### Update User Role

```http
PATCH /admin/users/{userId}/role
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "role": "CONTENT_CREATOR"
}
```

#### Suspend User

```http
PATCH /admin/users/{userId}/status
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "status": "SUSPENDED",
  "reason": "Terms of service violation"
}
```

### 11.2 Content Moderation

#### Get Pending Tours for Review

```http
GET /admin/tours/pending?page=1&limit=20
Authorization: Bearer <admin_jwt_token>
```

#### Approve/Reject Tour

```http
PATCH /admin/tours/{tourId}/moderation
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "action": "APPROVE",
  "notes": "Tour approved for publication"
}
```

### 11.3 System Analytics

#### Get Platform Analytics

```http
GET /admin/analytics/platform?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <admin_jwt_token>
```

#### Get System Health

```http
GET /admin/health
Authorization: Bearer <admin_jwt_token>
```

---

## 12. Error Codes

### Authentication Errors

- `AUTH_INVALID_CREDENTIALS` - Invalid email/password
- `AUTH_TOKEN_EXPIRED` - JWT token has expired
- `AUTH_TOKEN_INVALID` - Invalid JWT token
- `AUTH_INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `AUTH_ACCOUNT_SUSPENDED` - User account is suspended
- `AUTH_EMAIL_NOT_VERIFIED` - Email verification required

### Validation Errors

- `VALIDATION_ERROR` - Request validation failed
- `VALIDATION_FILE_TOO_LARGE` - Uploaded file exceeds size limit
- `VALIDATION_INVALID_FILE_TYPE` - Unsupported file type
- `VALIDATION_REQUIRED_FIELD` - Required field missing

### Resource Errors

- `RESOURCE_NOT_FOUND` - Requested resource not found
- `RESOURCE_ALREADY_EXISTS` - Resource already exists
- `RESOURCE_ACCESS_DENIED` - Access to resource denied
- `RESOURCE_QUOTA_EXCEEDED` - User quota exceeded

### Business Logic Errors

- `TOUR_MAX_SCENES_EXCEEDED` - Maximum scenes per tour exceeded
- `SCENE_MAX_HOTSPOTS_EXCEEDED` - Maximum hotspots per scene exceeded
- `TOUR_PUBLICATION_REQUIREMENTS_NOT_MET` - Tour cannot be published
- `MEDIA_PROCESSING_FAILED` - Media file processing failed

### Rate Limiting

- `RATE_LIMIT_EXCEEDED` - API rate limit exceeded
- `QUOTA_EXCEEDED` - Monthly quota exceeded

---

## 13. Rate Limits

### Authenticated Users

- **General API**: 1000 requests/hour
- **Media Upload**: 100 uploads/hour
- **Analytics**: 500 requests/hour

### API Keys

- **Configurable per key**: Default 10,000 requests/day
- **Upload operations**: 500/day per key
- **Burst limit**: 100 requests/minute

### Public APIs

- **Tour viewing**: 10,000 requests/hour per IP
- **Search**: 1,000 requests/hour per IP

---

## 14. Webhooks (Optional Future Feature)

### Webhook Events

- `tour.published` - Tour was published
- `tour.viewed` - Tour received a view
- `scene.completed` - User completed viewing a scene
- `hotspot.clicked` - Hotspot was clicked
- `media.processed` - Media file processing completed

### Webhook Payload Example

```json
{
  "event": "tour.published",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "tour_id": "tour_123",
    "title": "Modern Apartment Tour",
    "slug": "modern-apartment-tour",
    "published_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 15. SDK Examples

### JavaScript/TypeScript SDK Usage

```typescript
import { VirtualTourClient } from '@virtualtours/sdk';

const client = new VirtualTourClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.virtualtours.com/v1'
});

// Get public tours
const tours = await client.tours.getPublic({
  page: 1,
  limit: 20,
  category: 'real-estate'
});

// Get tour by slug
const tour = await client.tours.getBySlug('modern-apartment-tour');

// Track tour view
await client.analytics.trackTourView(tour.id, {
  sessionToken: 'session_123'
});
```

### cURL Examples

```bash
# Get public tours
curl -X GET "https://api.virtualtours.com/v1/tours/public?page=1&limit=20" \
  -H "Accept: application/json"

# Create a new tour (authenticated)
curl -X POST "https://api.virtualtours.com/v1/tours" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Tour",
    "description": "Description of the tour",
    "category": "real-estate"
  }'

# Upload panorama image
curl -X POST "https://api.virtualtours.com/v1/tours/tour_123/scenes/scene_456/panorama" \
  -H "Authorization: Bearer your_jwt_token" \
  -F "panorama=@/path/to/panorama.jpg"
```

This comprehensive API design provides a robust foundation for building the virtual tour platform with proper authentication, authorization, error handling, and scalability considerations.
