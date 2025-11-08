# Google Analytics Integration Guide for TuneCraft

## 🎯 Overview
TuneCraft is now integrated with Google Analytics 4 (GA4) to track user interactions, music plays, searches, and more.

## 📋 Setup Instructions

### Step 1: Create a Google Analytics Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **Admin** (gear icon in the bottom left)
4. Under **Property** column, click **Create Property**
5. Fill in your property details:
   - **Property name**: TuneCraft
   - **Reporting time zone**: Select your timezone (India Standard Time)
   - **Currency**: INR (Indian Rupee) or your preference
6. Click **Next**
7. Fill in business details and click **Create**
8. Accept the Terms of Service

### Step 2: Get Your Measurement ID

1. After creating the property, you'll see a **Data Streams** page
2. Click **Web** to add a web stream
3. Enter your website URL:
   - **Website URL**: Your deployed URL (e.g., `https://tunecraft.vercel.app`)
   - **Stream name**: TuneCraft Web
4. Click **Create stream**
5. You'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)
6. **Copy this Measurement ID** - you'll need it in the next step

### Step 3: Update Your Code

Replace `G-XXXXXXXXXX` with your actual Measurement ID in these files:

#### 1. `FrontEnd/index.html` (lines 30-37)
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YOUR-ID', {
    page_path: window.location.pathname,
  });
</script>
```

#### 2. `FrontEnd/src/utils/analytics.ts` (line 18)
```typescript
window.gtag('config', 'G-YOUR-ID', {
  page_path: url,
});
```

### Step 4: Deploy and Test

1. Build and deploy your app
2. Visit your deployed site
3. Go back to Google Analytics
4. Click on **Reports** > **Realtime**
5. You should see yourself as an active user!

## 📊 What's Being Tracked

### Automatic Tracking
- **Page views** - Every time a page loads
- **User sessions** - How long users stay on your site
- **User demographics** - Location, device, browser info
- **Traffic sources** - How users found your site

### Custom Events (Already Integrated)
- 🎵 **Song plays** - Track which songs users listen to
- ⏸️ **Song pauses** - When users pause playback
- ⏭️ **Song skips** - When users skip songs
- 🔍 **Searches** - What users search for
- 🧭 **Menu clicks** - Navigation patterns
- 🌟 **Trending views** - Which regions users explore
- 📧 **Contact clicks** - When users click Contact Us
- ❌ **Errors** - Track any errors that occur

## 🎨 Custom Event Examples

### Track Song Play
```typescript
import analytics from '@/utils/analytics';

analytics.trackSongPlay('Song Title', 'Artist Name', 'youtube');
```

### Track Search
```typescript
analytics.trackSearch('hip hop', 25);
```

### Track Menu Click
```typescript
analytics.trackMenuClick('Explore');
```

## 🔒 Privacy Considerations

1. **Add a Privacy Policy** to your website
2. **Cookie Consent Banner** - Consider adding a cookie consent banner
3. **GDPR Compliance** - If you have European users, ensure GDPR compliance
4. **Data Retention** - Configure data retention in GA4 settings

## 📈 Viewing Your Analytics

### Real-time Reports
- **Reports** > **Realtime** - See live users on your site

### User Behavior
- **Reports** > **Engagement** - See which events are most popular
- **Reports** > **Events** - Detailed event tracking

### Custom Reports
Create custom reports in GA4 to track:
- Most played songs
- Most searched terms
- Popular navigation paths
- User engagement metrics

## 🛠️ Advanced Configuration (Optional)

### Enable Enhanced Measurement
In GA4, go to **Admin** > **Data Streams** > Your stream > **Enhanced measurement**

Toggle these on for more insights:
- Scrolls
- Outbound clicks
- Site search
- Video engagement
- File downloads

### Set Up Conversions
Mark important events as conversions:
1. Go to **Admin** > **Events**
2. Find your event (e.g., `song_play`)
3. Toggle **Mark as conversion**

## 📱 Testing Locally

Google Analytics will work on localhost, but for better testing:
1. Use the **GA Debug Chrome Extension**
2. Open browser DevTools > Console
3. Look for `gtag` debug messages

## 🚀 Next Steps

1. ✅ Get your GA4 Measurement ID
2. ✅ Replace `G-XXXXXXXXXX` in the code
3. ✅ Deploy your changes
4. ✅ Verify tracking in GA4 Realtime
5. ✅ Explore reports and insights!

## 📞 Need Help?

- [Google Analytics Help Center](https://support.google.com/analytics)
- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [GA4 Event Tracking](https://support.google.com/analytics/answer/9267735)

---

**Happy Tracking! 📊🎵**
