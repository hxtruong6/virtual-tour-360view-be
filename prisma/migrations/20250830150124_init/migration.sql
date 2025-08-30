-- CreateEnum
CREATE TYPE "app"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CONTENT_CREATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "app"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "app"."TourStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "app"."TourDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "app"."HotspotType" AS ENUM ('NAVIGATION', 'INFO', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "app"."MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "app"."MediaStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "app"."AnalyticsEventType" AS ENUM ('TOUR_VIEW', 'SCENE_VIEW', 'HOTSPOT_CLICK', 'TOUR_SHARE', 'TOUR_BOOKMARK', 'SESSION_START', 'SESSION_END');

-- CreateTable
CREATE TABLE "app"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "avatar" TEXT,
    "role" "app"."UserRole" NOT NULL DEFAULT 'VIEWER',
    "status" "app"."UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "hashed_password" TEXT,
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "password_reset_token" TEXT,
    "password_reset_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."virtual_tours" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "slug" TEXT NOT NULL,
    "status" "app"."TourStatus" NOT NULL DEFAULT 'DRAFT',
    "difficulty" "app"."TourDifficulty" DEFAULT 'BEGINNER',
    "category" TEXT,
    "tags" TEXT[],
    "thumbnail_url" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT[],
    "allow_public_access" BOOLEAN NOT NULL DEFAULT true,
    "allow_embedding" BOOLEAN NOT NULL DEFAULT true,
    "autoplay_enabled" BOOLEAN NOT NULL DEFAULT false,
    "autoplay_speed" INTEGER DEFAULT 2,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "bookmark_count" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DOUBLE PRECISION DEFAULT 0,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "total_scenes" INTEGER NOT NULL DEFAULT 0,
    "total_hotspots" INTEGER NOT NULL DEFAULT 0,
    "estimated_duration" INTEGER,
    "apartment_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_by_id" TEXT,
    "updated_by_id" TEXT,

    CONSTRAINT "virtual_tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."scenes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "panorama_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "map_position_x" DOUBLE PRECISION,
    "map_position_y" DOUBLE PRECISION,
    "initial_view_angle" DOUBLE PRECISION DEFAULT 0,
    "max_zoom" DOUBLE PRECISION DEFAULT 3,
    "min_zoom" DOUBLE PRECISION DEFAULT 0.5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "tour_id" TEXT NOT NULL,

    CONSTRAINT "scenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."hotspots" (
    "id" TEXT NOT NULL,
    "type" "app"."HotspotType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position_x" DOUBLE PRECISION NOT NULL,
    "position_y" DOUBLE PRECISION NOT NULL,
    "position_z" DOUBLE PRECISION NOT NULL,
    "icon_url" TEXT,
    "icon_color" TEXT DEFAULT '#ffffff',
    "icon_size" DOUBLE PRECISION DEFAULT 1.0,
    "content" JSONB,
    "target_scene_id" TEXT,
    "animation_type" TEXT DEFAULT 'pulse',
    "animation_speed" DOUBLE PRECISION DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "scene_id" TEXT NOT NULL,

    CONSTRAINT "hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."media_files" (
    "id" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "media_type" "app"."MediaType" NOT NULL,
    "status" "app"."MediaStatus" NOT NULL DEFAULT 'UPLOADING',
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "processing_log" TEXT,
    "thumbnail_path" TEXT,
    "compressed_path" TEXT,
    "storage_provider" TEXT DEFAULT 'local',
    "external_url" TEXT,
    "gallery_category" TEXT,
    "gallery_subcategory" TEXT,
    "display_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "uploaded_by_id" TEXT,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."scene_media" (
    "id" TEXT NOT NULL,
    "scene_id" TEXT NOT NULL,
    "media_file_id" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,

    CONSTRAINT "scene_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."hotspot_media" (
    "id" TEXT NOT NULL,
    "hotspot_id" TEXT NOT NULL,
    "media_file_id" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,

    CONSTRAINT "hotspot_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."tour_translations" (
    "id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,

    CONSTRAINT "tour_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."scene_translations" (
    "id" TEXT NOT NULL,
    "scene_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "scene_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."hotspot_translations" (
    "id" TEXT NOT NULL,
    "hotspot_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB,

    CONSTRAINT "hotspot_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."user_sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."analytics_events" (
    "id" TEXT NOT NULL,
    "event_type" "app"."AnalyticsEventType" NOT NULL,
    "session_id" TEXT,
    "user_id" TEXT,
    "tour_id" TEXT,
    "scene_id" TEXT,
    "hotspot_id" TEXT,
    "event_data" JSONB,
    "duration" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "country" TEXT,
    "city" TEXT,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."tour_bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."tour_ratings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "allow_read" BOOLEAN NOT NULL DEFAULT true,
    "allow_write" BOOLEAN NOT NULL DEFAULT false,
    "allow_analytics" BOOLEAN NOT NULL DEFAULT false,
    "requests_per_day" INTEGER DEFAULT 1000,
    "requests_count" INTEGER NOT NULL DEFAULT 0,
    "last_reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."tour_embeds" (
    "id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "embed_token" TEXT NOT NULL,
    "domain" TEXT,
    "width" TEXT DEFAULT '100%',
    "height" TEXT DEFAULT '500px',
    "show_controls" BOOLEAN NOT NULL DEFAULT true,
    "show_branding" BOOLEAN NOT NULL DEFAULT true,
    "autoplay" BOOLEAN NOT NULL DEFAULT false,
    "embed_views" INTEGER NOT NULL DEFAULT 0,
    "last_access_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_embeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "icon_name" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."tour_amenities" (
    "id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "app"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "app"."users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "app"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "app"."users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "app"."users"("status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "app"."users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_tours_slug_key" ON "app"."virtual_tours"("slug");

-- CreateIndex
CREATE INDEX "virtual_tours_slug_idx" ON "app"."virtual_tours"("slug");

-- CreateIndex
CREATE INDEX "virtual_tours_status_idx" ON "app"."virtual_tours"("status");

-- CreateIndex
CREATE INDEX "virtual_tours_category_idx" ON "app"."virtual_tours"("category");

-- CreateIndex
CREATE INDEX "virtual_tours_created_by_id_idx" ON "app"."virtual_tours"("created_by_id");

-- CreateIndex
CREATE INDEX "virtual_tours_created_at_idx" ON "app"."virtual_tours"("created_at");

-- CreateIndex
CREATE INDEX "virtual_tours_published_at_idx" ON "app"."virtual_tours"("published_at");

-- CreateIndex
CREATE INDEX "virtual_tours_tags_idx" ON "app"."virtual_tours"("tags");

-- CreateIndex
CREATE INDEX "scenes_tour_id_idx" ON "app"."scenes"("tour_id");

-- CreateIndex
CREATE INDEX "scenes_order_idx" ON "app"."scenes"("order");

-- CreateIndex
CREATE UNIQUE INDEX "scenes_tour_id_order_key" ON "app"."scenes"("tour_id", "order");

-- CreateIndex
CREATE INDEX "hotspots_scene_id_idx" ON "app"."hotspots"("scene_id");

-- CreateIndex
CREATE INDEX "hotspots_type_idx" ON "app"."hotspots"("type");

-- CreateIndex
CREATE INDEX "hotspots_target_scene_id_idx" ON "app"."hotspots"("target_scene_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_files_file_name_key" ON "app"."media_files"("file_name");

-- CreateIndex
CREATE INDEX "media_files_file_name_idx" ON "app"."media_files"("file_name");

-- CreateIndex
CREATE INDEX "media_files_media_type_idx" ON "app"."media_files"("media_type");

-- CreateIndex
CREATE INDEX "media_files_status_idx" ON "app"."media_files"("status");

-- CreateIndex
CREATE INDEX "media_files_uploaded_by_id_idx" ON "app"."media_files"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "media_files_gallery_category_idx" ON "app"."media_files"("gallery_category");

-- CreateIndex
CREATE INDEX "media_files_display_order_idx" ON "app"."media_files"("display_order");

-- CreateIndex
CREATE INDEX "scene_media_scene_id_idx" ON "app"."scene_media"("scene_id");

-- CreateIndex
CREATE INDEX "scene_media_media_file_id_idx" ON "app"."scene_media"("media_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "scene_media_scene_id_media_file_id_key" ON "app"."scene_media"("scene_id", "media_file_id");

-- CreateIndex
CREATE INDEX "hotspot_media_hotspot_id_idx" ON "app"."hotspot_media"("hotspot_id");

-- CreateIndex
CREATE INDEX "hotspot_media_media_file_id_idx" ON "app"."hotspot_media"("media_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "hotspot_media_hotspot_id_media_file_id_key" ON "app"."hotspot_media"("hotspot_id", "media_file_id");

-- CreateIndex
CREATE INDEX "tour_translations_tour_id_idx" ON "app"."tour_translations"("tour_id");

-- CreateIndex
CREATE INDEX "tour_translations_language_idx" ON "app"."tour_translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "tour_translations_tour_id_language_key" ON "app"."tour_translations"("tour_id", "language");

-- CreateIndex
CREATE INDEX "scene_translations_scene_id_idx" ON "app"."scene_translations"("scene_id");

-- CreateIndex
CREATE INDEX "scene_translations_language_idx" ON "app"."scene_translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "scene_translations_scene_id_language_key" ON "app"."scene_translations"("scene_id", "language");

-- CreateIndex
CREATE INDEX "hotspot_translations_hotspot_id_idx" ON "app"."hotspot_translations"("hotspot_id");

-- CreateIndex
CREATE INDEX "hotspot_translations_language_idx" ON "app"."hotspot_translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "hotspot_translations_hotspot_id_language_key" ON "app"."hotspot_translations"("hotspot_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "app"."user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_session_token_idx" ON "app"."user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "app"."user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_started_at_idx" ON "app"."user_sessions"("started_at");

-- CreateIndex
CREATE INDEX "analytics_events_event_type_idx" ON "app"."analytics_events"("event_type");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "app"."analytics_events"("timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_session_id_idx" ON "app"."analytics_events"("session_id");

-- CreateIndex
CREATE INDEX "analytics_events_user_id_idx" ON "app"."analytics_events"("user_id");

-- CreateIndex
CREATE INDEX "analytics_events_tour_id_idx" ON "app"."analytics_events"("tour_id");

-- CreateIndex
CREATE INDEX "analytics_events_scene_id_idx" ON "app"."analytics_events"("scene_id");

-- CreateIndex
CREATE INDEX "analytics_events_hotspot_id_idx" ON "app"."analytics_events"("hotspot_id");

-- CreateIndex
CREATE INDEX "tour_bookmarks_user_id_idx" ON "app"."tour_bookmarks"("user_id");

-- CreateIndex
CREATE INDEX "tour_bookmarks_tour_id_idx" ON "app"."tour_bookmarks"("tour_id");

-- CreateIndex
CREATE UNIQUE INDEX "tour_bookmarks_user_id_tour_id_key" ON "app"."tour_bookmarks"("user_id", "tour_id");

-- CreateIndex
CREATE INDEX "tour_ratings_user_id_idx" ON "app"."tour_ratings"("user_id");

-- CreateIndex
CREATE INDEX "tour_ratings_tour_id_idx" ON "app"."tour_ratings"("tour_id");

-- CreateIndex
CREATE INDEX "tour_ratings_rating_idx" ON "app"."tour_ratings"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "tour_ratings_user_id_tour_id_key" ON "app"."tour_ratings"("user_id", "tour_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "app"."api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_key_hash_idx" ON "app"."api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_user_id_idx" ON "app"."api_keys"("user_id");

-- CreateIndex
CREATE INDEX "api_keys_is_active_idx" ON "app"."api_keys"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "tour_embeds_embed_token_key" ON "app"."tour_embeds"("embed_token");

-- CreateIndex
CREATE INDEX "tour_embeds_embed_token_idx" ON "app"."tour_embeds"("embed_token");

-- CreateIndex
CREATE INDEX "tour_embeds_tour_id_idx" ON "app"."tour_embeds"("tour_id");

-- CreateIndex
CREATE INDEX "tour_embeds_domain_idx" ON "app"."tour_embeds"("domain");

-- CreateIndex
CREATE INDEX "amenities_category_idx" ON "app"."amenities"("category");

-- CreateIndex
CREATE INDEX "amenities_is_active_idx" ON "app"."amenities"("is_active");

-- CreateIndex
CREATE INDEX "amenities_display_order_idx" ON "app"."amenities"("display_order");

-- CreateIndex
CREATE INDEX "tour_amenities_tour_id_idx" ON "app"."tour_amenities"("tour_id");

-- CreateIndex
CREATE INDEX "tour_amenities_amenity_id_idx" ON "app"."tour_amenities"("amenity_id");

-- CreateIndex
CREATE UNIQUE INDEX "tour_amenities_tour_id_amenity_id_key" ON "app"."tour_amenities"("tour_id", "amenity_id");

-- AddForeignKey
ALTER TABLE "app"."virtual_tours" ADD CONSTRAINT "virtual_tours_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."virtual_tours" ADD CONSTRAINT "virtual_tours_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "app"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."scenes" ADD CONSTRAINT "scenes_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "app"."virtual_tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."hotspots" ADD CONSTRAINT "hotspots_scene_id_fkey" FOREIGN KEY ("scene_id") REFERENCES "app"."scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."hotspots" ADD CONSTRAINT "hotspots_target_scene_id_fkey" FOREIGN KEY ("target_scene_id") REFERENCES "app"."scenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."media_files" ADD CONSTRAINT "media_files_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "app"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."scene_media" ADD CONSTRAINT "scene_media_scene_id_fkey" FOREIGN KEY ("scene_id") REFERENCES "app"."scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."scene_media" ADD CONSTRAINT "scene_media_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "app"."media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."hotspot_media" ADD CONSTRAINT "hotspot_media_hotspot_id_fkey" FOREIGN KEY ("hotspot_id") REFERENCES "app"."hotspots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."hotspot_media" ADD CONSTRAINT "hotspot_media_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "app"."media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."tour_translations" ADD CONSTRAINT "tour_translations_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "app"."virtual_tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."scene_translations" ADD CONSTRAINT "scene_translations_scene_id_fkey" FOREIGN KEY ("scene_id") REFERENCES "app"."scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."hotspot_translations" ADD CONSTRAINT "hotspot_translations_hotspot_id_fkey" FOREIGN KEY ("hotspot_id") REFERENCES "app"."hotspots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."analytics_events" ADD CONSTRAINT "analytics_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "app"."user_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."analytics_events" ADD CONSTRAINT "analytics_events_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "app"."virtual_tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."analytics_events" ADD CONSTRAINT "analytics_events_scene_id_fkey" FOREIGN KEY ("scene_id") REFERENCES "app"."scenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."analytics_events" ADD CONSTRAINT "analytics_events_hotspot_id_fkey" FOREIGN KEY ("hotspot_id") REFERENCES "app"."hotspots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."tour_bookmarks" ADD CONSTRAINT "tour_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."tour_bookmarks" ADD CONSTRAINT "tour_bookmarks_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "app"."virtual_tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."tour_ratings" ADD CONSTRAINT "tour_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."tour_ratings" ADD CONSTRAINT "tour_ratings_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "app"."virtual_tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."api_keys" ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."tour_embeds" ADD CONSTRAINT "tour_embeds_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "app"."virtual_tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."tour_amenities" ADD CONSTRAINT "tour_amenities_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "app"."virtual_tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."tour_amenities" ADD CONSTRAINT "tour_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "app"."amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
