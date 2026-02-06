# Ad Surfer System - Implementation Guide

## Overview
The Ad Surfer system allows users to earn money by viewing ads. Ads automatically open in new tabs and close after 20-30 seconds, similar to neon.today.

## Features Implemented

### 1. **Ad Surfing Component** (`AdSurfer.tsx`)
- Displays ads with automatic opening in new tabs
- Each ad stays open for 20-30 seconds (configurable per ad)
- Auto-closes and opens the next ad automatically
- Shows countdown timer with progress bar
- Tracks total ads viewed
- "Stop Surfing" button to halt the process

### 2. **Admin Panel** (`AdminAds.tsx`)
- Manage ads (Create, Read, Update, Delete)
- Set custom view duration for each ad (20-30 seconds)
- View all active/inactive ads
- Toggle ad status

### 3. **Database Schema** (shared/schema.ts)
```typescript
// Ads Table
- id: UUID (Primary Key)
- url: Text (Ad link)
- title: Text (Ad title)
- description: Text (Optional)
- viewDuration: Integer (20-30 seconds)
- isActive: Boolean
- createdAt: Timestamp

// Ad Views Table (for tracking)
- id: UUID (Primary Key)
- userId: Text (User ID)
- adId: Text (FK to ads)
- viewedAt: Timestamp
- duration: Integer (actual view duration)
```

### 4. **Backend API Routes** (server/routes.ts)

#### Ad Management
- `GET /api/ads?active=true` - Get active ads
- `GET /api/ads/:id` - Get single ad
- `POST /api/ads` - Create ad
- `PUT /api/ads/:id` - Update ad
- `DELETE /api/ads/:id` - Delete ad

#### View Tracking
- `POST /api/ad-views` - Record ad view
- `GET /api/ad-views/user/:userId` - Get user's ad history
- `GET /api/ad-stats/:adId` - Get ad statistics

### 5. **Storage Layer** (server/storage.ts)
Complete CRUD operations for ads and ad views with in-memory storage (can be swapped for database).

### 6. **Frontend Integration**
- New "Ad Surfer" tab in Dashboard
- Integrated with existing TabsUI component
- Real-time ad view tracking
- Responsive design with animations

## How It Works

### User Flow
1. User clicks "Start Surfing" on the Ad Surfer tab
2. System fetches active ads from server
3. First ad opens in a new window
4. Timer counts down from 20-30 seconds
5. When timer reaches 0:
   - Current ad window closes
   - Ad view is recorded to database
   - Next ad automatically opens
6. Process repeats until all ads are viewed
7. User can click "Stop Surfing" to exit anytime

### Admin Flow
1. Admin navigates to `/admin/ads`
2. Can view all ads in a table
3. Create new ads with custom URLs and view duration
4. Edit existing ads
5. Delete ads
6. See active/inactive status

## Demo Ads
The system comes with 3 demo ads:
- Demo Ad 1: 25 seconds
- Demo Ad 2: 28 seconds
- Demo Ad 3: 20 seconds

## Configuration

### View Duration
Each ad can have a custom view duration between 20-30 seconds. This is set:
- When creating/editing ads in admin panel
- Default: 25 seconds

### Automatic Behavior
- Ads open in new tabs with dimensions 800x600
- No user confirmation needed
- Timer is visible with progress bar
- System automatically moves to next ad

## API Response Examples

### Get Active Ads
```json
[
  {
    "id": "abc123",
    "url": "https://example.com/ad1",
    "title": "Ad Title",
    "description": "Ad Description",
    "viewDuration": 25,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Record Ad View
```json
{
  "id": "view123",
  "userId": "user456",
  "adId": "abc123",
  "duration": 25,
  "viewedAt": "2024-01-01T00:00:00Z"
}
```

## Database Integration
Currently using in-memory storage. To switch to PostgreSQL:

1. Uncomment Drizzle ORM code in `storage.ts`
2. Run `npm run db:push` to create tables
3. Update storage class to use database queries instead of maps

## Future Enhancements
- Earnings tracking and payment system
- User authentication for earning history
- Ad performance analytics
- Rate limiting per user
- Ad quality ratings
- Referral system
- Earnings dashboard

## Troubleshooting

### Ads not opening
- Check browser popup blocker settings
- Ensure ads URLs are valid
- Check console for CORS errors

### Timer not counting down
- Check if window is closed prematurely
- Verify JavaScript is enabled
- Check browser console for errors

### Ad views not recorded
- Ensure user session exists
- Check API endpoint is responding
- Verify database/storage is working
