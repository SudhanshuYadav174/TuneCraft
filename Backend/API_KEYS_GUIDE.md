# API Keys Setup Guide

## YouTube Data API v3 Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a project" at the top
4. Click "NEW PROJECT"
5. Enter a project name (e.g., "Wave Flow Music App")
6. Click "CREATE"

### Step 2: Enable YouTube Data API v3
1. In the Google Cloud Console, make sure your new project is selected
2. Go to the **APIs & Services** → **Library**
3. Search for "YouTube Data API v3"
4. Click on "YouTube Data API v3"
5. Click **"ENABLE"**

### Step 3: Create API Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"API key"**
4. Copy the generated API key
5. (Optional) Click "RESTRICT KEY" to add restrictions:
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Click "SAVE"

### Step 4: Add to Environment
Add this to your `.env` file:
```
YOUTUBE_API_KEY=your_actual_api_key_here
```

---

## SoundCloud API Client ID

### Step 1: Create SoundCloud Developer Account
1. Go to [SoundCloud Developers](https://developers.soundcloud.com/)
2. Sign in with your SoundCloud account (create one if you don't have it)
3. Click **"Register a new application"**

### Step 2: Register Your Application
1. Fill out the application form:
   - **App name**: "Wave Flow Music Streaming" (or any name)
   - **Description**: "Music streaming platform for educational purposes"
   - **Website URL**: http://localhost:3001 (or your domain)
   - **Redirect URI**: http://localhost:3001/callback
2. Click **"Register"**

### Step 3: Get Your Client ID
1. After registration, you'll see your app details
2. Copy the **"Client ID"** (NOT the Client Secret)
3. The Client ID is what you need for the API

### Step 4: Add to Environment
Add this to your `.env` file:
```
SOUNDCLOUD_CLIENT_ID=your_actual_client_id_here
```

---

## Testing Without API Keys

If you want to test the backend immediately without API keys, you can:

### Option 1: Use Mock Data
I can modify the services to return mock/sample data when API keys are not available.

### Option 2: Start with One API
You can start with just one API (YouTube is easier to get) and test with that.

### Option 3: Use the Backend for Frontend Integration
Even without external APIs, you can:
- Test all endpoints
- Verify CORS settings
- Check rate limiting
- Test error handling
- Set up the frontend integration

---

## Quick Start (No API Keys Needed)

To test the backend without API keys right now:

1. **Start the server:**
   ```bash
   cd C:\Users\HP\Downloads\wave-flow-backend
   node src/server.js
   ```

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Visit the API documentation:**
   Open: http://localhost:3001/api/docs

4. **Test with your frontend:**
   Make sure your frontend can connect to http://localhost:3001

---

## Important Notes

### YouTube API Quotas
- Free tier: 10,000 units per day
- Each search costs ~100 units
- Each video details request costs ~1 unit
- Monitor usage at [Google Cloud Console](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)

### SoundCloud API Limits
- Rate limits apply (specific limits not publicly documented)
- The unofficial scraper we're using may have different limitations
- Consider implementing proper error handling and retry logic

### Development vs Production
- For development: Basic API keys are sufficient
- For production: You'll need proper OAuth setup and may need to apply for higher quotas

---

## Troubleshooting

### YouTube API Issues
- **403 Forbidden**: Check if API is enabled and key is correct
- **Quota Exceeded**: Wait until quota resets (daily) or upgrade plan
- **Invalid Key**: Double-check the API key in your `.env` file

### SoundCloud API Issues
- **CORS Issues**: SoundCloud API calls are made from backend (not frontend)
- **Rate Limiting**: Implement caching and respect rate limits
- **Scraper Issues**: The unofficial scraper may break if SoundCloud changes their site

Would you like me to help you with any specific part of getting these API keys, or would you prefer to modify the backend to work with mock data for now?