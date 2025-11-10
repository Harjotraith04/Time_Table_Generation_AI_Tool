# 🚀 Complete Deployment Guide - Render + Vercel

This guide will walk you through hosting your **backend on Render** and **frontend on Vercel** step-by-step.

---

## 📋 Prerequisites

Before you begin, make sure you have:

1. ✅ **GitHub Account** - To host your code repository
2. ✅ **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. ✅ **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
4. ✅ **MongoDB Atlas Account** - Free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## 📦 PART 1: Setup MongoDB Atlas (Database)

### Step 1.1: Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in
2. Click **"Build a Database"** or **"Create"**
3. Choose **FREE (M0)** tier
4. Select a cloud provider and region (choose one closest to your Render server region)
5. Name your cluster (e.g., `TimetableCluster`)
6. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 1.2: Setup Database Access

1. In Atlas, go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `admin` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** and **COPY IT** (you'll need this!)
6. Database User Privileges: Select **"Read and write to any database"**
7. Click **"Add User"**

### Step 1.3: Setup Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add `0.0.0.0/0`)
   - Note: For production, you can restrict this later to Render's IPs
4. Click **"Confirm"**

### Step 1.4: Get Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you copied earlier
7. Add database name after `.net/` like this:
   ```
   mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/timetable?retryWrites=true&w=majority
   ```
8. **SAVE THIS STRING** - you'll use it in Render environment variables

---

## 🔧 PART 2: Prepare Your Code

### Step 2.1: Push to GitHub

1. Open PowerShell in your project folder:
   ```powershell
   cd "c:\Users\HARJOT SINGH\Desktop\Capstone\Time_Table_Generation_AI_Tool"
   ```

2. Initialize git (if not already done):
   ```powershell
   git init
   git add .
   git commit -m "Ready for deployment"
   ```

3. Create a new repository on GitHub:
   - Go to [github.com/new](https://github.com/new)
   - Name: `Time_Table_Generation_AI_Tool`
   - Visibility: Public or Private
   - Click **"Create repository"**

4. Push your code:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/Time_Table_Generation_AI_Tool.git
   git branch -M main
   git push -u origin main
   ```

### Step 2.2: Generate JWT Secret

You need a secure random string for JWT_SECRET:

```powershell
# Run this in PowerShell to generate a secure secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Copy the output - this is your JWT_SECRET.

---

## 🖥️ PART 3: Deploy Backend to Render

### Step 3.1: Create New Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not already connected)
4. Find and select your repository: `Time_Table_Generation_AI_Tool`
5. Click **"Connect"**

### Step 3.2: Configure Web Service

Fill in these settings:

**Basic Settings:**
- **Name**: `timetable-backend` (or your choice)
- **Region**: Choose closest to your users (e.g., Oregon, Singapore)
- **Branch**: `main`
- **Root Directory**: `server` ⚠️ **IMPORTANT!**
- **Environment**: `Node`
- **Build Command**: Leave empty (no build needed)
- **Start Command**: `npm run start`

**Instance Type:**
- Select **Free** tier (or paid if you need)

### Step 3.3: Add Environment Variables

Click **"Advanced"** then **"Add Environment Variable"** for each:

| Key | Value | Example |
|-----|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string from Step 1.4 | `mongodb+srv://admin:pass123@cluster0.xxxxx.mongodb.net/timetable?retryWrites=true&w=majority` |
| `JWT_SECRET` | Your generated secret from Step 2.2 | `aB3dE5fG7hI9jK2lM4nO6pQ8rS0tU1vW3xY5z` |
| `NODE_ENV` | `production` | `production` |
| `CLIENT_URL` | Leave as `https://placeholder.com` for now, we'll update after Vercel | `https://placeholder.com` |
| `GEMINI_API_KEY` | Your Gemini API key (optional) | `AIzaSy...` |

**⚠️ Note:** We'll update `CLIENT_URL` after deploying frontend!

### Step 3.4: Configure Health Check

Scroll down to **Health Check Path** and enter:
```
/api/health
```

### Step 3.5: Deploy!

1. Click **"Create Web Service"**
2. Render will start deploying (takes 2-5 minutes)
3. Watch the logs - you should see:
   ```
   Server running on port 10000
   Connected to MongoDB
   ```

### Step 3.6: Get Your Backend URL

Once deployed successfully:
1. At the top of your service page, you'll see your URL:
   ```
   https://timetable-backend-xxxx.onrender.com
   ```
2. **COPY THIS URL** - you'll need it for Vercel!

### Step 3.7: Test Backend

Open these URLs in your browser:

1. Health check: `https://your-backend-url.onrender.com/api/health`
   - Should return: `{"status":"OK","timestamp":"...","uptime":...}`

2. If you get a 404 or error, check Render logs:
   - Click **"Logs"** tab
   - Look for errors in MongoDB connection or server startup

---

## 🌐 PART 4: Deploy Frontend to Vercel

### Step 4.1: Create New Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. If not connected, click **"Continue with GitHub"**
4. Find your repository: `Time_Table_Generation_AI_Tool`
5. Click **"Import"**

### Step 4.2: Configure Project

**Configure Project Settings:**

1. **Project Name**: `timetable-frontend` (or your choice)
2. **Framework Preset**: Vite (should auto-detect)
3. **Root Directory**: Click **"Edit"** → Select `client` folder → Click **"Continue"**

**Build Settings:**
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Step 4.3: Add Environment Variables

Click **"Environment Variables"** section:

Add this variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com/api` |

**Example:**
```
VITE_API_URL = https://timetable-backend-xxxx.onrender.com/api
```

⚠️ **IMPORTANT:** Replace with YOUR actual Render backend URL from Step 3.6!

### Step 4.4: Deploy!

1. Click **"Deploy"**
2. Vercel will build and deploy (takes 1-3 minutes)
3. Watch the build logs for any errors

### Step 4.5: Get Your Frontend URL

Once deployed:
1. You'll see: **"Congratulations!"**
2. Your site URL will be shown:
   ```
   https://timetable-frontend-xxxx.vercel.app
   ```
3. **COPY THIS URL**

### Step 4.6: Test Frontend

1. Click **"Visit"** or open your Vercel URL
2. You should see the landing page
3. Try logging in (if you have test data)

---

## 🔗 PART 5: Connect Frontend & Backend (CRITICAL!)

### Step 5.1: Update Backend CORS

1. Go back to **Render Dashboard**
2. Click on your `timetable-backend` service
3. Go to **"Environment"** tab
4. Find `CLIENT_URL` variable
5. Click **"Edit"**
6. Replace `https://placeholder.com` with your **actual Vercel URL**:
   ```
   https://timetable-frontend-xxxx.vercel.app
   ```
7. Click **"Save Changes"**
8. Render will automatically **redeploy** your backend

### Step 5.2: Wait for Redeploy

- Watch the **"Events"** tab in Render
- Wait until status shows **"Live"** (usually 1-2 minutes)

### Step 5.3: Test Connection

1. Open your Vercel site: `https://timetable-frontend-xxxx.vercel.app`
2. Open **Developer Tools** (F12)
3. Go to **"Network"** tab
4. Try to login or navigate around
5. Check that API calls go to: `https://your-backend-url.onrender.com/api/...`
6. Verify responses are successful (Status 200)

---

## ✅ PART 6: Final Verification

### Step 6.1: Test All Endpoints

Open these URLs and verify:

1. **Backend Health:**
   ```
   https://your-backend-url.onrender.com/api/health
   ```
   Should return: `{"status":"OK"}`

2. **Frontend:**
   ```
   https://your-frontend-url.vercel.app
   ```
   Should load the landing page

### Step 6.2: Test Key Features

1. **Login**: Try logging in with admin credentials
2. **Create Teacher**: Add a teacher to test database connection
3. **Generate Timetable**: Test the core functionality
4. **Chatbot**: Test AI chatbot if using Gemini

### Step 6.3: Check Logs

**Render Logs:**
- Go to Render Dashboard → Your service → **"Logs"** tab
- Should see: "Server running", "Connected to MongoDB"

**Vercel Logs:**
- Go to Vercel Dashboard → Your project → **"Deployments"** → Click latest → **"Functions"** tab
- Check for any runtime errors

---

## 🐛 Troubleshooting

### Problem 1: Backend shows "Application failed to respond"

**Solution:**
1. Check Render logs for errors
2. Verify `MONGODB_URI` is correct (password, database name)
3. Check MongoDB Atlas network access allows `0.0.0.0/0`
4. Ensure start command is `npm run start` not `npm start`

### Problem 2: Frontend can't connect to backend

**Solution:**
1. Verify `VITE_API_URL` in Vercel matches your Render URL
2. Check `CLIENT_URL` in Render matches your Vercel URL
3. Open browser DevTools → Network tab → see if CORS errors
4. Redeploy both services after changing env vars

### Problem 3: MongoDB Connection Error

**Solution:**
1. Check `MONGODB_URI` format:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/database?retryWrites=true&w=majority
   ```
2. Verify password doesn't have special characters (use URL encoding)
3. Check MongoDB Atlas user has "readWrite" permission
4. Verify network access allows all IPs (`0.0.0.0/0`)

### Problem 4: "Cannot find module" errors

**Solution:**
1. Check that `package.json` exists in `server/` folder
2. Verify all dependencies are listed in `package.json`
3. In Render, try manual deploy with cleared cache

### Problem 5: Frontend shows blank page

**Solution:**
1. Check browser console for errors (F12)
2. Verify `VITE_API_URL` environment variable is set in Vercel
3. Redeploy frontend after adding env vars
4. Check Vercel build logs for errors

---

## 🎯 Quick Reference

### Environment Variables Summary

**Render (Backend):**
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/timetable?retryWrites=true&w=majority
JWT_SECRET=your-generated-secret-here
CLIENT_URL=https://your-vercel-site.vercel.app
NODE_ENV=production
GEMINI_API_KEY=your-gemini-key (optional)
```

**Vercel (Frontend):**
```bash
VITE_API_URL=https://your-render-backend.onrender.com/api
```

### Important URLs

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Your Backend**: https://timetable-backend-xxxx.onrender.com
- **Your Frontend**: https://timetable-frontend-xxxx.vercel.app

### Common Commands

**Redeploy Backend (Render):**
- Go to service → Click **"Manual Deploy"** → **"Deploy latest commit"**

**Redeploy Frontend (Vercel):**
- Go to project → **"Deployments"** → Click ⋯ on latest → **"Redeploy"**

**View Logs:**
- **Render**: Service → **"Logs"** tab
- **Vercel**: Project → **"Deployments"** → Click deployment → View logs

---

## 🎉 Success Checklist

- [ ] MongoDB Atlas cluster created and connection string obtained
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render with all env vars
- [ ] Backend health check returns `{"status":"OK"}`
- [ ] Frontend deployed on Vercel with `VITE_API_URL`
- [ ] `CLIENT_URL` updated in Render with Vercel URL
- [ ] Frontend loads successfully
- [ ] API calls from frontend reach backend (check Network tab)
- [ ] Login works
- [ ] Database operations work (create teacher, student, etc.)
- [ ] Timetable generation works
- [ ] Chatbot responds (if using Gemini)

---

## 📞 Need Help?

If you encounter issues:

1. **Check Logs First**: Both Render and Vercel provide detailed logs
2. **Verify Environment Variables**: Double-check all values
3. **Test Endpoints**: Use Postman or browser to test API directly
4. **CORS Issues**: Ensure `CLIENT_URL` matches exactly (no trailing slash)
5. **MongoDB**: Verify connection string, password, and network access

---

**🚀 You're all set! Your timetable application is now live on the internet!**
