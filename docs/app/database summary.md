Database Schema Design Summary
I've designed a comprehensive PostgreSQL database schema for your virtual tour platform that addresses all the requirements from the Virtual Tour Features document. Here's what I've implemented:
🏗️ Core Architecture

1. Core Entities:
User: Complete user management with roles, authentication, and audit fields
VirtualTour: Tours with metadata, SEO, settings, and statistics
Scene: Individual panoramic scenes with positioning and viewing settings
Hotspot: Interactive elements with 3D positioning and flexible content
2. Media Management:
MediaFile: Centralized file storage with processing status and metadata
SceneMedia & HotspotMedia: Junction tables linking media to scenes/hotspots
Support for images, videos, audio, and documents with optimization tracking
3. Internationalization:
TourTranslation, SceneTranslation, HotspotTranslation: Multi-language support
Flexible translation system for all user-facing content
📊 Analytics & Tracking
4. User Behavior:
UserSession: Session tracking with device/location information
AnalyticsEvent: Comprehensive event tracking (views, clicks, interactions)
TourBookmark & TourRating: User engagement features
🔧 Advanced Features
5. API & Embedding:
ApiKey: Secure API access with permissions and rate limiting
TourEmbed: Embed configuration for third-party integration
🎯 Key Design Decisions
CUID Primary Keys: More secure and URL-friendly than auto-incrementing integers
Comprehensive Indexing: Strategic indexes on frequently queried fields (email, slug, status, timestamps)
Soft Deletes: deletedAt fields for data recovery and audit trails
JSON Fields: Flexible content storage for hotspot data and event metadata
Cascade Deletes: Proper foreign key relationships with cascading for data integrity
Enum Types: Type-safe status and role management
Audit Fields: Full tracking of creation, updates, and user actions
🚀 Scalability Features
Statistics Denormalization: Pre-computed counts on tours for performance
Media Processing Pipeline: Separate processing status and optimization tracking
Session Management: Detailed user session tracking for analytics
Rate Limiting: Built-in API key management with usage tracking
📈 Analytics Capabilities
The schema supports all analytics requirements:
User behavior tracking (page views, hotspot clicks, session duration)
Geographic analytics (IP-based location tracking)
Tour performance metrics (view counts, ratings, bookmarks)
Device and browser analytics
Real-time and historical reporting capabilities

<!--  -->

erDiagram
    User {
        string id PK
        string email UK
        string username UK
        string firstName
        string lastName
        string avatar
        UserRole role
        UserStatus status
        string language
        string timezone
        string hashedPassword
        datetime emailVerifiedAt
        datetime lastLoginAt
        string passwordResetToken
        datetime passwordResetExpiresAt
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    VirtualTour {
        string id PK
        string title
        string description
        string location
        string slug UK
        TourStatus status
        TourDifficulty difficulty
        string category
        string[] tags
        string thumbnailUrl
        string metaTitle
        string metaDescription
        string[] metaKeywords
        boolean allowPublicAccess
        boolean allowEmbedding
        boolean autoplayEnabled
        int autoplaySpeed
        int viewCount
        int shareCount
        int bookmarkCount
        float averageRating
        int totalRatings
        int totalScenes
        int totalHotspots
        int estimatedDuration
        datetime createdAt
        datetime updatedAt
        datetime publishedAt
        datetime deletedAt
        string createdById FK
        string updatedById FK
    }

    Scene {
        string id PK
        string title
        string description
        int order
        string panoramaUrl
        string thumbnailUrl
        float mapPositionX
        float mapPositionY
        float initialViewAngle
        float maxZoom
        float minZoom
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
        string tourId FK
    }

    Hotspot {
        string id PK
        HotspotType type
        string title
        string description
        float positionX
        float positionY
        float positionZ
        string iconUrl
        string iconColor
        float iconSize
        json content
        string targetSceneId FK
        string animationType
        float animationSpeed
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
        string sceneId FK
    }

    MediaFile {
        string id PK
        string originalName
        string fileName UK
        string filePath
        int fileSize
        string mimeType
        MediaType mediaType
        MediaStatus status
        int width
        int height
        float duration
        string processingLog
        string thumbnailPath
        string compressedPath
        string storageProvider
        string externalUrl
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
        string uploadedById FK
    }

    UserSession {
        string id PK
        string sessionToken UK
        string userId FK
        string ipAddress
        string userAgent
        string deviceType
        string browser
        string os
        string country
        string city
        datetime startedAt
        datetime endedAt
        datetime lastActivityAt
    }

    AnalyticsEvent {
        string id PK
        AnalyticsEventType eventType
        string sessionId FK
        string userId FK
        string tourId FK
        string sceneId FK
        string hotspotId FK
        json eventData
        float duration
        datetime timestamp
        string ipAddress
        string country
        string city
    }

    TourTranslation {
        string id PK
        string tourId FK
        string language
        string title
        string description
        string metaTitle
        string metaDescription
    }

    SceneTranslation {
        string id PK
        string sceneId FK
        string language
        string title
        string description
    }

    HotspotTranslation {
        string id PK
        string hotspotId FK
        string language
        string title
        string description
        json content
    }

    TourBookmark {
        string id PK
        string userId FK
        string tourId FK
        datetime createdAt
    }

    TourRating {
        string id PK
        string userId FK
        string tourId FK
        int rating
        string review
        datetime createdAt
        datetime updatedAt
    }

    ApiKey {
        string id PK
        string name
        string keyHash UK
        string userId FK
        boolean allowRead
        boolean allowWrite
        boolean allowAnalytics
        int requestsPerDay
        int requestsCount
        datetime lastResetAt
        boolean isActive
        datetime expiresAt
        datetime lastUsedAt
        datetime createdAt
        datetime updatedAt
    }

    TourEmbed {
        string id PK
        string tourId FK
        string embedToken UK
        string domain
        string width
        string height
        boolean showControls
        boolean showBranding
        boolean autoplay
        int embedViews
        datetime lastAccessAt
        datetime createdAt
        datetime updatedAt
    }

    SceneMedia {
        string id PK
        string sceneId FK
        string mediaFileId FK
        string mediaType
        int order
    }

    HotspotMedia {
        string id PK
        string hotspotId FK
        string mediaFileId FK
        string mediaType
        int order
    }

    %% Core Relationships
    User ||--o{ VirtualTour : "creates"
    User ||--o{ VirtualTour : "updates"
    VirtualTour ||--o{ Scene : "contains"
    Scene ||--o{ Hotspot : "has"
    Hotspot }o--|| Scene : "targets"

    %% Media Relationships
    User ||--o{ MediaFile : "uploads"
    Scene ||--o{ SceneMedia : "uses"
    Hotspot ||--o{ HotspotMedia : "uses"
    MediaFile ||--o{ SceneMedia : "referenced_in"
    MediaFile ||--o{ HotspotMedia : "referenced_in"

    %% Translation Relationships
    VirtualTour ||--o{ TourTranslation : "translated"
    Scene ||--o{ SceneTranslation : "translated"
    Hotspot ||--o{ HotspotTranslation : "translated"

    %% Analytics Relationships
    User ||--o{ UserSession : "has"
    UserSession ||--o{ AnalyticsEvent : "generates"
    User ||--o{ AnalyticsEvent : "performs"
    VirtualTour ||--o{ AnalyticsEvent : "tracked"
    Scene ||--o{ AnalyticsEvent : "tracked"
    Hotspot ||--o{ AnalyticsEvent : "tracked"

    %% Engagement Relationships
    User ||--o{ TourBookmark : "bookmarks"
    VirtualTour ||--o{ TourBookmark : "bookmarked"
    User ||--o{ TourRating : "rates"
    VirtualTour ||--o{ TourRating : "rated"

    %% API & Embedding Relationships
    User ||--o{ ApiKey : "owns"
    VirtualTour ||--o{ TourEmbed : "embedded"
