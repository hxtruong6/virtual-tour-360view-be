# Virtual Tour Platform API - TODO Checklist

This document tracks the implementation status of all API endpoints and features defined in the API design document.

## 📊 **Overall Progress**

- **Completed:** 18 endpoints ✅
- **In Progress:** 1 endpoint 🚧
- **Not Started:** 81+ endpoints ❌
- **Current Focus:** Admin Authentication, Virtual Tours & Hotspot Management

---

## 1. **Authentication & Authorization APIs**

### 1.1 User Authentication

- ❌ `POST /auth/register` - Register User
- ❌ `POST /auth/login` - Login User  
- ❌ `POST /auth/verify-email` - Verify Email
- ❌ `POST /auth/refresh` - Refresh Token
- ❌ `POST /auth/logout` - Logout
- ❌ `POST /auth/reset-password` - Reset Password Request
- ❌ `POST /auth/reset-password/confirm` - Reset Password Confirm

### 1.2 User Profile Management

- ❌ `GET /auth/profile` - Get Current User Profile
- ❌ `PATCH /auth/profile` - Update User Profile
- ❌ `POST /auth/change-password` - Change Password

### 1.3 Admin Authentication

- ✅ `POST /admin/auth/login` - Admin Login
- ✅ `GET /admin/auth/profile` - Get Admin Profile
- 🚧 `POST /admin/auth/logout` - Admin Logout (basic implementation)

---

## 2. **Virtual Tours API**

### 2.1 Public Tour Access

- ❌ `GET /api/v1/public/tours` - Get Published Tours (Public)
- ❌ `GET /api/v1/public/tours/{slug}` - Get Tour by Slug (Public)
- [ ] List All Amenities: `GET /api/v1/public/amenities`
- [ ] Filter Tour by Amenities: `GET /api/v1/public/tours?amenities=amenity-id-1,amenity-id-2`
- [ ] Filter Tour by Room Category: `GET /api/v1/public/tours?room_types=studio,1pn,2pn,3pn,sv`
- [ ] Get list visual galleries: `GET /api/v1/public/visual-galleries`
- [ ] Get collection of tours by visual gallery id: `GET /api/v1/public/tours?gallery_ids=gallery-id-1,gallery-id-2`

### 2.3 Admin Tour Management

- ✅ `GET /admin/tours` - List All Virtual Tours
- ✅ `GET /admin/tours/{id}` - Get Virtual Tour Details
- ✅ `POST /admin/tours` - Create Virtual Tour
- ✅ `PUT /admin/tours/{id}` - Update Virtual Tour
- ✅ `DELETE /admin/tours/{id}` - Delete Virtual Tour
- ✅ `POST /admin/tours/{id}/publish` - Publish Tour
- ✅ `POST /admin/tours/{id}/archive` - Archive Tour
- ✅ `POST /admin/tours/{id}/duplicate` - Duplicate Tour

---

## 3. **Scenes API**

### 3.1 Scene Management

- ✅ `GET /admin/tours/{tourId}/scenes` - Get Tour Scenes
- ✅ `POST /admin/tours/{tourId}/scenes` - Create Scene
- ✅ `PUT /admin/tours/{tourId}/scenes/{sceneId}` - Update Scene
- ✅ `DELETE /admin/tours/{tourId}/scenes/{sceneId}` - Delete Scene
- ❌ `POST /admin/tours/{tourId}/scenes/{sceneId}/panorama` - Upload Scene Panorama
- ✅ `POST /admin/tours/{tourId}/scenes/bulk` - Bulk Upload Scenes
- ✅ `PUT /admin/tours/{tourId}/scenes/reorder` - Reorder Scenes

---

## 4. **Hotspots API**

### 4.1 Hotspot Management

- ✅ `GET /admin/tours/{tourId}/scenes/{sceneId}/hotspots` - Get Scene Hotspots
- ✅ `POST /admin/tours/{tourId}/scenes/{sceneId}/hotspots` - Create Hotspot
- ✅ `PUT /admin/tours/{tourId}/scenes/{sceneId}/hotspots/{hotspotId}` - Update Hotspot
- ✅ `DELETE /admin/tours/{tourId}/scenes/{sceneId}/hotspots/{hotspotId}` - Delete Hotspot

---

## 5. **Media Management API**

### 5.1 File Upload

- ✅ `POST /api/v1/files/upload` - Upload Media File
- [x] {{url}}/uploads/{{filePath1}} - View by public

---

## 6. **User Engagement API**

### 6.1 Bookmarks

- ❌ `POST /admin/tours/{tourId}/bookmark` - Bookmark Tour
- ❌ `DELETE /admin/tours/{tourId}/bookmark` - Remove Bookmark
- ❌ `GET /admin/bookmarks` - Get User Bookmarks

### 6.2 Ratings

- ❌ `POST /admin/tours/{tourId}/rating` - Rate Tour
- ❌ `PUT /admin/tours/{tourId}/rating` - Update Rating
- ❌ `GET /admin/tours/{tourId}/ratings` - Get Tour Ratings

---

## 7. **Analytics API**

### 7.1 Tour Analytics

- ❌ `GET /admin/tours/{tourId}/analytics` - Get Tour Analytics
- ❌ `POST /admin/tours/{tourId}/view` - Track Tour View
- ❌ `POST /admin/tours/{tourId}/scenes/{sceneId}/view` - Track Scene View
- ❌ `POST /admin/tours/{tourId}/scenes/{sceneId}/hotspots/{hotspotId}/click` - Track Hotspot Click

---

## 9. **Embedding API**

### 9.1 Tour Embedding

- ❌ `POST /tours/{tourId}/embed` - Create Embed Token
- ❌ `GET /tours/{tourId}/embed/{embedToken}/analytics` - Get Embed Analytics
- ❌ `PATCH /tours/{tourId}/embed/{embedToken}` - Update Embed Settings
- ❌ `DELETE /tours/{tourId}/embed/{embedToken}` - Delete Embed

---

## 10. **API Keys Management**

### 10.1 API Key Operations

- ❌ `POST /api-keys` - Create API Key
- ❌ `GET /api-keys` - Get API Keys
- ❌ `PATCH /api-keys/{keyId}` - Update API Key
- ❌ `DELETE /api-keys/{keyId}` - Revoke API Key
- ❌ `GET /api-keys/{keyId}/usage` - Get API Key Usage

---

## 11. **Admin APIs**

### 11.1 User Management (Admin Only)

- ❌ `GET /admin/users` - Get All Users
- ❌ `PATCH /admin/users/{userId}/role` - Update User Role
- ❌ `PATCH /admin/users/{userId}/status` - Suspend User

### 11.2 Content Moderation

- ❌ `GET /admin/tours/pending` - Get Pending Tours for Review
- ❌ `PATCH /admin/tours/{tourId}/moderation` - Approve/Reject Tour

### 11.3 System Analytics

- ❌ `GET /admin/analytics/platform` - Get Platform Analytics
- ❌ `GET /admin/health` - Get System Health

---

## 🏗️ **Infrastructure & Setup**

### Database & Schema

- ✅ Prisma schema setup with User table
- ✅ Virtual tour entities (VirtualTour, Scene, Hotspot)
- ✅ User roles and status enums
- ✅ Database seeding for admin user
- ❌ Database migration for all entities
- ❌ Complete entity relationships

### Authentication & Security

- ✅ JWT strategy for admin authentication
- ✅ Auth decorators (@Auth, @AuthUser)
- ✅ Password hashing with bcrypt
- ❌ Role-based permissions system
- ❌ API key authentication
- ❌ Rate limiting
- ❌ CORS configuration

### Data Transfer Objects (DTOs)

- ✅ Admin auth DTOs (login, profile)
- ✅ Virtual tour DTOs (CRUD operations)
- ✅ Scene DTOs (CRUD operations, bulk actions)
- ❌ User auth DTOs
- ✅ Hotspot DTOs
- ❌ Media upload DTOs
- ❌ Analytics DTOs

### Error Handling

- ✅ Basic error responses
- ❌ Comprehensive error codes
- ❌ Error logging and monitoring
- ❌ Validation error details

---

## 🎯 **Current Sprint Focus**

### ✅ **Completed in Current Sprint:**

1. Admin authentication system with Prisma integration
2. Virtual tours CRUD operations (admin panel)
3. Scene management CRUD operations (admin panel)
4. Hotspot management CRUD operations (admin panel)
5. Database seeding for admin user
6. JWT token validation for admin routes
7. DTOs aligned with Prisma entities with proper pagination
8. Bulk scene operations and reordering functionality
9. Scene-hotspot relationship integration

### 🚧 **In Progress:**

1. Code quality improvements and linting fixes
2. Testing scene and hotspot management endpoints

### 📋 **Next Sprint Priorities:**

1. **Media Upload** - Panorama image upload and processing
2. **Public Virtual Tours API** - Allow public access to published tours
3. **User Registration & Authentication** - Non-admin user system
4. **Analytics** - Basic tracking for tours and scenes
5. **Advanced Hotspot Features** - Media attachments and complex interactions

---

## 🧪 **Testing Status**

### Manual Testing

- ✅ Admin login endpoint tested
- ✅ Virtual tours CRUD operations tested
- 🚧 Scene management CRUD operations (ready for testing)
- 🚧 Hotspot management CRUD operations (ready for testing)
- ❌ Public tours access
- ❌ File upload functionality
- ❌ User registration flow

### Automated Testing

- ❌ Unit tests for controllers
- ❌ Integration tests for APIs
- ❌ End-to-end testing setup

---

## 📝 **Documentation Status**

- ✅ API design document complete
- ✅ Virtual tours API summary
- ✅ Prisma integration guide
- ✅ This TODO checklist
- ❌ Postman collection
- ❌ API SDK documentation
- ❌ Deployment guide

---

## 🏁 **Milestone Tracking**

### **MVP Milestone (Current)**

**Goal:** Admin panel for virtual tour management

- ✅ Admin authentication
- ✅ Virtual tour CRUD
- 🚧 Basic content management

### **Public Access Milestone**

**Goal:** Public can view published tours

- ❌ Public tours API
- ❌ Tour embedding
- ❌ Basic analytics

### **Full User System Milestone**

**Goal:** User registration and content creation

- ❌ User authentication
- ❌ User tour creation
- ❌ User profiles

### **Advanced Features Milestone**

**Goal:** Advanced functionality

- ❌ Multi-language support
- ❌ Advanced analytics
- ❌ API keys system

---

## 📞 **Quick Reference**

### **Ready to Test:**

```bash
# Admin Login
POST /api/v1/admin/auth/login
{
  "username": "admin",
  "password": "Admin@123456"
}

# Get Virtual Tours
GET /api/v1/admin/tours
Authorization: Bearer <token>

# Create Virtual Tour
POST /api/v1/admin/tours
Authorization: Bearer <token>

# Get Tour Scenes
GET /api/v1/admin/tours/{tourId}/scenes
Authorization: Bearer <token>

# Create Scene
POST /api/v1/admin/tours/{tourId}/scenes
Authorization: Bearer <token>

# Get Scene Hotspots
GET /api/v1/admin/tours/{tourId}/scenes/{sceneId}/hotspots
Authorization: Bearer <token>

# Create Hotspot
POST /api/v1/admin/tours/{tourId}/scenes/{sceneId}/hotspots
Authorization: Bearer <token>
```

### **Database Setup:**

```bash
# Seed admin user
npm run db:seed
```

---

**Last Updated:** January 2024
**Current Version:** v1.0.0-MVP
**Next Review:** After public tours implementation
