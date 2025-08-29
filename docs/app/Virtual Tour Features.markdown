# Virtual Tour Platform Feature List

This document outlines the key features for a virtual tour platform, designed to provide an immersive, interactive, and manageable experience for users (e.g., potential real estate buyers) and administrators. The features are categorized into Core Functionality, User Experience Enhancements, Admin/CMS Features, and Advanced Features, prioritized for phased implementation.

## Core Functionality
These are the foundational features required for a functional virtual tour.

1. **360-Degree Panorama Viewer**
   - Display high-resolution equirectangular images (JPEG/PNG) in a 360-degree view.
   - Support zoom, pan, and rotation for full exploration.
   - Compatible with desktop and mobile browsers (responsive design).
   - Example: Users can view a property’s exterior or interior by dragging to rotate 360°.

2. **Multi-Scene Navigation (Hotspots)**
   - Allow clickable hotspots (e.g., arrow icons) on panoramas to switch between scenes (e.g., from living room to kitchen).
   - Mimic Google Street View navigation with smooth transitions.
   - Hotspots include visual indicators and optional tooltips (e.g., “Go to Balcony”).
   - Example: Click an arrow to move from the entrance to the lobby.

3. **Dynamic Scene Loading**
   - Load panorama images and metadata (hotspot positions, target scenes) dynamically via API from the backend.
   - Support for multiple tours (e.g., different properties) selectable by users.
   - Example: Fetch tour data for “Apartment A” or “Apartment B” from the backend.

## User Experience Enhancements
These features improve interactivity, accessibility, and engagement.

4. **Interactive Hotspots with Information**
   - Add hotspots that display pop-ups with text, images, or videos (e.g., “This is the master bedroom, 200 sq ft”).
   - Support customizable styles (e.g., icons, colors) for hotspots.
   - Example: Click a hotspot on a kitchen appliance to see its specifications.

5. **Mobile and VR Support**
   - Ensure touch controls for mobile (swipe to rotate, pinch to zoom).
   - Add basic VR compatibility (e.g., WebXR or device orientation for cardboard VR).
   - Example: Users can view the tour in VR mode using a smartphone headset.

6. **Map Integration**
   - Display a 2D/3D mini-map showing the current location within the tour (e.g., floor plan or site map).
   - Allow clicking on map points to jump to corresponding scenes.
   - Example: A floor plan where clicking “Bedroom 2” loads its panorama.

7. **Full-Screen and Autoplay Modes**
   - Toggle full-screen view for immersive experience.
   - Optional autoplay to rotate the panorama automatically (configurable speed).
   - Example: Users click a button to enter full-screen or enable a slow auto-rotation.

8. **Multilingual Support**
   - Support text translations for hotspot labels, tooltips, and UI elements (e.g., English, Vietnamese).
   - Allow dynamic language switching via a dropdown.
   - Example: Vietnamese users see “Phòng khách” while English users see “Living Room.”

## Admin/CMS Features
These enable content management for administrators to create and manage tours.

9. **Tour Creation and Management**
   - Provide an admin interface to upload equirectangular images or videos.
   - Allow defining tour metadata (title, description, tags).
   - Example: Admin uploads a panorama for “Apartment A Lobby” and sets its title.

10. **Hotspot Management**
    - Interface to add/edit/delete hotspots with 3D coordinates (x, y, z) and target scenes.
    - Support preview mode to test hotspot placement.
    - Example: Admin clicks on the panorama to place an arrow hotspot linking to another room.

11. **User Authentication and Roles**
    - Secure admin login for CMS access (e.g., JWT-based).
    - Role-based access: Admins manage tours; public users view only.
    - Example: Only authenticated admins can upload new panoramas.

12. **Bulk Upload and Processing**
    - Support batch uploads of multiple panorama images.
    - Automatically optimize images (e.g., compress, resize) for web performance.
    - Example: Admin uploads 10 images for a property, and the system processes them into a tour.

## Advanced Features
These add polish, scalability, or specialized functionality for future phases.

13. **Analytics Tracking**
    - Track user interactions (e.g., which scenes are viewed most, hotspot clicks).
    - Provide admin reports on tour engagement.
    - Example: Report shows 80% of users clicked the “Balcony” hotspot.

14. **Customizable UI Themes**
    - Allow admins to customize viewer UI (e.g., button colors, fonts) via CMS.
    - Support branding (e.g., logo, colors) for different clients.
    - Example: Change hotspot icons to match a real estate company’s brand.

15. **Video Panorama Support**
    - Enable 360-degree video playback (MP4/WebM) as scenes.
    - Support hotspots on videos for navigation.
    - Example: A 360° video tour of a moving elevator with clickable exits.

16. **Offline Caching**
    - Cache panorama images and metadata for offline access (using Service Workers).
    - Ensure seamless experience in low-connectivity areas.
    - Example: Users can view a cached tour without internet.

17. **API for Third-Party Integration**
    - Expose REST APIs for external apps to fetch tour data or embed tours.
    - Support embedding tours in other websites via iframe or JS snippet.
    - Example: A real estate listing site embeds the tour using an API key.

## Implementation Notes
- **Prioritization**: Start with Core Functionality (1-3) for a minimum viable product (MVP). Then add User Experience Enhancements (4-8) for engagement, followed by Admin/CMS Features (9-12) for scalability. Advanced Features (13-17) are for future iterations.
- **Tech Stack**: Use Panolens.js for the viewer, Next.js for the frontend (dynamic rendering, API integration), and NestJS for the backend (API, file storage, CMS logic). Store data in MongoDB or PostgreSQL.
- **User Stories**:
  - As a visitor, I want to explore a property in 360° and navigate between rooms intuitively.
  - As an admin, I want to upload panoramas and define navigation hotspots easily.
  - As a developer, I want APIs to integrate tours with other platforms.
- **Success Criteria**: Smooth navigation, high-quality visuals, responsive design, and easy content management.

This list provides a roadmap for building a robust virtual tour platform, balancing user needs with administrative control.