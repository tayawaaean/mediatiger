# Frontend Connection Fix Guide

## 🚨 Problem Identified
Your Vercel frontend is still trying to connect to `https://18.142.174.87:3006` instead of `http://18.142.174.87:3006`.

## ✅ What I Fixed
1. **Updated MusicComponent.tsx**: Changed the fallback URL from HTTPS to HTTP
2. **Server is working**: Your Lightrail server is responding correctly to HTTP requests

## 🔧 Complete Fix Steps

### Step 1: Verify Server Code Changes ✅ DONE
- Server code has been updated to use HTTP
- CORS is properly configured for Vercel
- GET and POST endpoints are working

### Step 2: Update Frontend Code ✅ DONE
The main issue was in `src/features/music/pages/MusicComponent.tsx`:
```typescript
// OLD (causing SSL errors)
const API_URL_MUSIC_LIST = import.meta.env.VITE_MUSIC_API_URL || "https://18.142.174.87:3006/api/music";

// NEW (working)
const API_URL_MUSIC_LIST = import.meta.env.VITE_MUSIC_API_URL || "http://18.142.174.87:3006/api/music";
```

### Step 3: Set Vercel Environment Variable (Recommended)
In your Vercel dashboard, add this environment variable:
```
VITE_MUSIC_API_URL=http://18.142.174.87:3006/api/music
```

**How to add in Vercel:**
1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add new variable:
   - Name: `VITE_MUSIC_API_URL`
   - Value: `http://18.142.174.87:3006/api/music`
   - Environment: Production (and Preview if you want)
5. Click "Save"
6. Redeploy your project

### Step 4: Alternative - Use Relative URLs
If you prefer not to use environment variables, you can modify the code to use relative URLs:

```typescript
// In MusicComponent.tsx, change to:
const API_URL_MUSIC_LIST = "/api/music";
```

Then update your `vite.config.ts` to proxy all `/api/*` requests to your server:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://18.142.174.87:3006',
        changeOrigin: true,
      },
    },
  },
});
```

## 🧪 Testing Your Fix

### 1. Test Locally First
```bash
cd mediatiger
npm run dev
```
Visit your local app and test the music loading.

### 2. Deploy to Vercel
```bash
git add .
git commit -m "Fix: Change music API from HTTPS to HTTP"
git push
```

### 3. Test on Vercel
- Wait for deployment to complete
- Visit your Vercel app
- Check the music page
- Look for any console errors

## 🔍 Debugging

### Check Browser Console
Look for these errors:
- `ERR_SSL_PROTOCOL_ERROR` → Still using HTTPS
- `CORS error` → CORS configuration issue
- `Network error` → Connection issue

### Check Network Tab
1. Open Developer Tools
2. Go to Network tab
3. Refresh the music page
4. Look for the `/api/music` request
5. Check if it's using HTTP or HTTPS

### Expected Network Request
```
Request URL: http://18.142.174.87:3006/api/music
Method: POST
Status: 200 OK
```

## 🚀 Deployment Checklist

- [ ] Frontend code updated (HTTPS → HTTP)
- [ ] Server restarted with new code
- [ ] Local testing passes
- [ ] Vercel environment variable set (optional)
- [ ] Code committed and pushed
- [ ] Vercel deployment completed
- [ ] Production testing passes

## 🆘 If Still Not Working

### Check 1: Environment Variables
Verify in Vercel dashboard that `VITE_MUSIC_API_URL` is set to `http://18.142.174.87:3006/api/music`

### Check 2: Server Logs
Look at your Lightrail server logs for incoming requests:
```
📡 Request from [IP]: POST /api/music
```

### Check 3: CORS Headers
In browser Network tab, check if the response has proper CORS headers:
```
Access-Control-Allow-Origin: https://mediatiger-two.vercel.app
```

### Check 4: Force Refresh
Sometimes Vercel caches old builds. Try:
1. Force refresh the page (Ctrl+F5)
2. Clear browser cache
3. Wait a few minutes for cache to clear

## 🎯 Expected Result

After implementing these fixes:
- ✅ No more SSL protocol errors
- ✅ Music loads correctly on Vercel
- ✅ Network requests show HTTP (not HTTPS)
- ✅ Server logs show successful connections from Vercel

## 📞 Support

If you continue having issues:
1. Check the browser console for specific error messages
2. Verify the Network tab shows HTTP requests
3. Check your Vercel environment variables
4. Ensure your server is running and accessible
