# 🚀 Quick Setup - Google Analytics for TuneCraft

## Step 1: Get Your GA4 Measurement ID
1. Go to https://analytics.google.com/
2. Create a new property for TuneCraft
3. Add a Web data stream
4. Copy your Measurement ID (looks like `G-ABC123XYZ`)

## Step 2: Update Environment Files

### For Production (`.env.production`):
```bash
VITE_GA_MEASUREMENT_ID=G-YOUR-ACTUAL-ID
```

### For Development (`.env.development`):
```bash
VITE_GA_MEASUREMENT_ID=
# Leave empty to disable tracking in development
```

## Step 3: Deploy
```bash
# Build and deploy your app
npm run build

# Or if using Vercel/Netlify, just push to GitHub
git add .
git commit -m "Add Google Analytics"
git push
```

## Step 4: Verify
1. Visit your deployed site
2. Go to GA4 > Reports > Realtime
3. You should see yourself as an active user! 🎉

---

## 📊 What Gets Tracked Automatically

✅ **Menu Clicks** - Explore, Genres, Albums, Radio  
✅ **Contact Us Clicks** - When users click your email button  
✅ **Page Views** - Every page load  
✅ **User Sessions** - Time spent on site  
✅ **User Demographics** - Location, device, browser

## 🎵 Add More Tracking (Optional)

In your components, import and use:

```typescript
import analytics from '@/utils/analytics';

// Track song plays
analytics.trackSongPlay('Song Title', 'Artist', 'youtube');

// Track searches
analytics.trackSearch('hip hop', 25);

// Track errors
analytics.trackError('API failed', 'network_error');
```

---

**That's it! Your analytics are ready! 📈**

For detailed setup, see `GOOGLE_ANALYTICS_SETUP.md`
