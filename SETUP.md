# Lumina Call - Setup Guide

## Quick Setup Checklist

Follow these steps in order to get the application running:

### ✅ Step 1: Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm or bun package manager
- [ ] Git installed

### ✅ Step 2: Get Your API Keys

#### Clerk (Authentication)
1. Go to https://clerk.com
2. Sign up / Log in
3. Create a new application
4. Copy your **Publishable Key** (starts with `pk_test_...`)
5. (Optional) Copy your **Secret Key** (starts with `sk_test_...`)

#### Supabase (Database)
1. Go to https://supabase.com
2. Sign up / Log in
3. Create a new project
4. Go to Project Settings → API
5. Copy your **Project URL**
6. Copy your **Anon/Public Key**

### ✅ Step 3: Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### ✅ Step 4: Configure Environment Variables

#### Frontend (.env in root)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:3001
```

#### Backend (server/.env)
```env
PORT=3001
CLIENT_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Optional
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### ✅ Step 5: Set Up Supabase Database

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run"
5. Verify that tables were created:
   - meetings
   - voice_channels
   - meeting_participants

### ✅ Step 6: Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
You should see: `🚀 Server running on port 3001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
You should see: `Local: http://localhost:5173/`

### ✅ Step 7: Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Sign Up" or "Login"
3. Complete Clerk authentication
4. You should reach the Dashboard
5. Click "New Meeting" to test video functionality
6. Allow camera/microphone access when prompted

## Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution:** Make sure the backend server is running on port 3001

### Issue: "Camera/Microphone access denied"
**Solution:**
- Grant permissions in your browser
- On Chrome: chrome://settings/content/camera
- Try using HTTPS in production

### Issue: "Meeting not found"
**Solution:**
- Check that Supabase schema is set up correctly
- Verify environment variables are correct
- Check browser console for errors

### Issue: "User not authenticated"
**Solution:**
- Verify Clerk publishable key is correct
- Clear browser cache and cookies
- Try signing out and back in

### Issue: "Video not showing"
**Solution:**
- Check camera permissions
- Ensure WebRTC is supported (modern browser)
- Check browser console for WebRTC errors
- Try refreshing the page

## Testing Checklist

- [ ] Can create an account with Clerk
- [ ] Can log in successfully
- [ ] Dashboard loads correctly
- [ ] Can create a new meeting
- [ ] Meeting code is generated and displayed
- [ ] Can join a meeting using a code
- [ ] Camera and microphone work
- [ ] Can see own video feed
- [ ] Can toggle audio on/off
- [ ] Can toggle video on/off
- [ ] Can send chat messages
- [ ] Can see participants list
- [ ] Can share screen (if supported)
- [ ] Can raise hand
- [ ] Can leave meeting
- [ ] Multiple participants can join the same meeting

## Production Deployment

### Environment Setup
- Use HTTPS for both frontend and backend
- Update CORS settings in server/index.js
- Update CLIENT_URL and VITE_API_URL to production URLs
- Use production Clerk keys
- Consider using TURN servers for better connectivity

### Recommended Hosting
- **Frontend:** Vercel, Netlify, or AWS Amplify
- **Backend:** Railway, Render, Heroku, or AWS EC2
- **Database:** Supabase (already cloud-hosted)

### Production Environment Variables

**Frontend:**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_key
VITE_API_URL=https://your-backend.com
```

**Backend:**
```env
PORT=3001
CLIENT_URL=https://your-frontend.com

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_key
CLERK_SECRET_KEY=sk_live_your_production_key
```

## Next Steps


Once everything is working:
1. Customize the UI colors and branding
2. Add more features from the roadmap
3. Set up analytics
4. Configure domain and SSL
5. Scale with SFU for larger meetings

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure dependencies are installed
4. Check that both servers are running
5. Review the README for detailed documentation

Happy coding! 🚀
