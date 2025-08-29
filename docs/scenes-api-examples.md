# Scene Management API Examples

## Authentication Required

All scene endpoints require admin authentication:

```
Authorization: Bearer <admin_jwt_token>
```

## Endpoints

### 1. Get Tour Scenes

```http
GET /api/v1/admin/tours/{tourId}/scenes?page=1&limit=10&search=living&sortBy=order&sortOrder=asc
```

**Response:**

```json
{
  "items": [
    {
      "id": "scene_123",
      "title": "Living Room",
      "description": "Spacious living room with modern furniture",
      "order": 1,
      "panoramaUrl": "https://cdn.example.com/panorama1.jpg",
      "thumbnailUrl": "https://cdn.example.com/thumb1.jpg",
      "mapPositionX": 100,
      "mapPositionY": 150,
      "initialViewAngle": 0,
      "maxZoom": 3.0,
      "minZoom": 0.5,
      "tourId": "tour_456",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

### 2. Get Scene Details

```http
GET /api/v1/admin/tours/{tourId}/scenes/{sceneId}
```

**Response:**

```json
{
  "id": "scene_123",
  "title": "Living Room",
  "description": "Spacious living room with modern furniture",
  "order": 1,
  "panoramaUrl": "https://cdn.example.com/panorama1.jpg",
  "thumbnailUrl": "https://cdn.example.com/thumb1.jpg",
  "mapPositionX": 100,
  "mapPositionY": 150,
  "initialViewAngle": 0,
  "maxZoom": 3.0,
  "minZoom": 0.5,
  "tourId": "tour_456",
  "hotspots": [],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### 3. Create Scene

```http
POST /api/v1/admin/tours/{tourId}/scenes
Content-Type: application/json

{
  "title": "Kitchen",
  "description": "Modern kitchen with island",
  "order": 2,
  "panoramaUrl": "https://cdn.example.com/kitchen_panorama.jpg",
  "thumbnailUrl": "https://cdn.example.com/kitchen_thumb.jpg",
  "mapPositionX": 200,
  "mapPositionY": 100,
  "initialViewAngle": 45,
  "maxZoom": 3.5,
  "minZoom": 0.8
}
```

**Response (201 Created):**

```json
{
  "id": "scene_new789",
  "title": "Kitchen",
  "description": "Modern kitchen with island",
  "order": 2,
  "panoramaUrl": "https://cdn.example.com/kitchen_panorama.jpg",
  "thumbnailUrl": "https://cdn.example.com/kitchen_thumb.jpg",
  "mapPositionX": 200,
  "mapPositionY": 100,
  "initialViewAngle": 45,
  "maxZoom": 3.5,
  "minZoom": 0.8,
  "tourId": "tour_456",
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

### 4. Update Scene

```http
PUT /api/v1/admin/tours/{tourId}/scenes/{sceneId}
Content-Type: application/json

{
  "title": "Updated Kitchen",
  "description": "Newly renovated modern kitchen",
  "order": 3
}
```

### 5. Delete Scene

```http
DELETE /api/v1/admin/tours/{tourId}/scenes/{sceneId}
```

**Response: 204 No Content**

### 6. Bulk Create Scenes

```http
POST /api/v1/admin/tours/{tourId}/scenes/bulk
Content-Type: application/json

{
  "scenes": [
    {
      "title": "Bedroom 1",
      "description": "Master bedroom with ensuite",
      "order": 3,
      "panoramaUrl": "https://cdn.example.com/bedroom1.jpg"
    },
    {
      "title": "Bedroom 2",
      "description": "Guest bedroom",
      "order": 4,
      "panoramaUrl": "https://cdn.example.com/bedroom2.jpg"
    },
    {
      "title": "Bathroom",
      "description": "Main bathroom",
      "order": 5,
      "panoramaUrl": "https://cdn.example.com/bathroom.jpg"
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "created": [
    {
      "id": "scene_bed1",
      "title": "Bedroom 1",
      "order": 3,
      "tourId": "tour_456"
    },
    {
      "id": "scene_bed2", 
      "title": "Bedroom 2",
      "order": 4,
      "tourId": "tour_456"
    },
    {
      "id": "scene_bath",
      "title": "Bathroom",
      "order": 5,
      "tourId": "tour_456"
    }
  ],
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0
  }
}
```

### 7. Reorder Scenes

```http
PUT /api/v1/admin/tours/{tourId}/scenes/reorder
Content-Type: application/json

{
  "scenes": [
    { "sceneId": "scene_123", "order": 1 },
    { "sceneId": "scene_789", "order": 2 },
    { "sceneId": "scene_456", "order": 3 }
  ]
}
```

**Response (200 OK):**
Returns updated scene list with new ordering.

## Error Responses

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Virtual tour not found"
}
```

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Scene with order 2 already exists in this tour"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Notes

- **Order Validation**: Scene orders must be unique within a tour
- **Auto-numbering**: If no order is specified, it will be automatically assigned
- **Soft Delete**: Deleted scenes are marked with `deletedAt` timestamp
- **Authentication**: All endpoints require admin authentication
- **Validation**: All fields are validated according to the DTO constraints
- **Pagination**: Scene lists support pagination, search, and sorting
