# Quick Start Guide - Ad Surfer System

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm
- PostgreSQL 16 (optional, for persistent storage)

### Installation
```bash
cd Device-City-Loader
npm install
```

### Running the Project

#### Development Mode (with both client and server)
```bash
npm run dev
```

#### Client Only (frontend)
```bash
npm run dev:client
# Runs on http://localhost:5000
```

#### Production Build
```bash
npm run build
npm start
```

---

## 📖 User Guide

### For Users - Earning Money with Ad Surfer

1. **Start Surfing**
   - Open the application at `http://localhost:5000`
   - Click the "Ad Surfer" tab
   - Click "Start Surfing" button

2. **Watch Ads**
   - Each ad opens in a new browser tab
   - Timer shows how long to watch (20-30 seconds)
   - Keep the tab in focus for proper tracking
   - Do NOT close the ad tab manually

3. **Automatic Progression**
   - When timer reaches 0, ad closes automatically
   - View is recorded to your account
   - Next ad opens automatically
   - Continue until you want to stop

4. **Stop Anytime**
   - Click "Stop Surfing" to exit
   - Your views are saved

### Statistics
- **Total Ads Viewed**: Shows how many ads you've watched
- **Available Ads**: Total ads waiting to be viewed
- **Active Nodes**: System status indicator

---

## 🔐 Admin Guide

### Accessing Admin Panel
1. Navigate to `http://localhost:5000/admin/ads`
2. You can now manage ads

### Managing Ads

#### Create New Ad
1. Click "Add New Ad" button
2. Fill in the form:
   - **URL**: Where the ad links to
   - **Title**: Ad name
   - **Description**: Optional details
   - **Duration**: How long users watch (20-30 seconds)
3. Click "Create Ad"

#### Edit Existing Ad
1. Click the "Edit" button next to an ad
2. Modify fields
3. Click "Update Ad"

#### Delete Ad
1. Click the "Delete" button
2. Confirm deletion

---

## 🔌 API Endpoints

### Get All Active Ads
```
GET /api/ads?active=true

Response:
[
  {
    "id": "abc123",
    "url": "https://example.com",
    "title": "Ad Title",
    "description": "Ad Description",
    "viewDuration": 25,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Create New Ad
```
POST /api/ads
Content-Type: application/json

{
  "url": "https://example.com/promotion",
  "title": "Amazing Deal",
  "description": "Check this out!",
  "viewDuration": 25
}

Response: Created ad object with ID
```

### Record Ad View
```
POST /api/ad-views
Content-Type: application/json

{
  "adId": "abc123",
  "duration": 25
}

Response:
{
  "id": "view123",
  "userId": "user456",
  "adId": "abc123",
  "duration": 25,
  "viewedAt": "2024-01-01T00:00:00Z"
}
```

### Get Ad Statistics
```
GET /api/ad-stats/abc123

Response:
{
  "totalViews": 150,
  "avgDuration": 24.5
}
```

---

## 📊 Default Demo Ads

The system comes pre-loaded with 3 demo ads:

| Title | Duration | URL |
|-------|----------|-----|
| Earn Money Online | 25s | https://example.com/ad1 |
| Best Deals Today | 28s | https://example.com/ad2 |
| Limited Time Offer | 20s | https://example.com/ad3 |

---

## 🗂️ Project Structure

```
Device-City-Loader/
├── client/
│   └── src/
│       ├── components/
│       │   ├── AdSurfer.tsx          ← Ad surfing component
│       │   └── ...
│       └── pages/
│           ├── Dashboard.tsx          ← Main dashboard
│           ├── AdminAds.tsx          ← Admin panel
│           └── ...
├── server/
│   ├── routes.ts                      ← API endpoints
│   ├── storage.ts                     ← Database operations
│   └── ...
├── shared/
│   └── schema.ts                      ← Database schema
└── package.json
```

---

## 🔧 Configuration

### Change Ad View Duration
Edit `shared/schema.ts`:
```typescript
viewDuration: integer("view_duration").default(25) // Change 25 to your value
```

### Add More Demo Ads
Edit `server/storage.ts` in the constructor:
```typescript
this.ads.set("demo4", {
  id: "demo4",
  url: "https://yoursite.com/ad",
  title: "New Ad Title",
  description: "Description here",
  viewDuration: 25,
  isActive: true,
  createdAt: new Date(),
});
```

---

## 🐛 Troubleshooting

### Ads Not Opening
**Problem**: Ad windows don't appear
**Solution**: 
- Check browser popup blocker
- Allow popups for localhost:5000
- Verify ad URLs are valid

### Timer Not Counting Down
**Problem**: Timer frozen or not moving
**Solution**:
- Refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled

### Views Not Recording
**Problem**: Ads viewed but view count doesn't increase
**Solution**:
- Check Network tab in DevTools
- Verify server is running
- Check console for API errors

### Server Won't Start
**Problem**: `npm run dev` fails
**Solution**:
- Run `npm install` again
- Check Node.js version: `node -v` (need v20+)
- Clear node_modules: `rm -r node_modules && npm install`

---

## 💡 Tips & Tricks

### For Users
- Keep your browser tab in focus while watching ads
- Don't manually close ad windows - let them auto-close
- Check statistics to track your progress
- Stop surfing when needed, you can resume later

### For Admins
- Test ads before publishing
- Use clear, descriptive titles
- Set appropriate view durations (users prefer shorter, faster-paced)
- Monitor view statistics for engagement
- Delete inactive or low-performing ads

---

## 🔐 Security Notes

Currently using demo authentication. For production:
1. Add user authentication
2. Implement rate limiting (prevent abuse)
3. Add IP blocking for suspicious activity
4. Require email verification
5. Add CAPTCHA for large view batches

---

## 📈 Monetization Ideas

Once view tracking is working:
- Pay users per ad view (e.g., $0.01 per ad)
- Bonus for viewing streak
- Referral commissions
- Premium ads with higher payouts
- Withdrawal system

---

## 🆘 Getting Help

### Check Logs
```bash
# Server logs
npm run dev

# Browser console logs (DevTools)
F12 → Console tab
```

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| CORS error | Server not running | Start server with `npm run dev` |
| Ads empty | No ads in database | Create ads in admin panel |
| Window.open blocked | Browser security | Allow popups in settings |
| API 404 | Wrong endpoint | Check API documentation |

---

## 📝 Next Steps

1. ✅ Install dependencies
2. ✅ Start development server
3. ✅ Test the ad surfer
4. ✅ Try the admin panel
5. ⏭️ Customize ads
6. ⏭️ Add user authentication
7. ⏭️ Implement payment system

---

## 📞 Support

For issues or questions:
1. Check IMPLEMENTATION_SUMMARY.md for technical details
2. Check AD_SURFER_README.md for feature documentation
3. Review API endpoints above
4. Check browser console for errors

---

**Happy Ad Surfing! 🚀**
