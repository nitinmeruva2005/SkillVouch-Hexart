# MongoDB Atlas Setup Guide

## 🚀 MongoDB Atlas Configuration (5 Minutes)

### **Step 1: Create MongoDB Atlas Account**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** → **"Create a free cluster"**
3. Sign up with Google, GitHub, or email
4. Choose **"M0 Sandbox"** (Free forever, 512MB)

### **Step 2: Configure Cluster**

1. **Cloud Provider:** AWS
2. **Region:** Choose closest to your users (e.g., us-east-1)
3. **Cluster Name:** `skillvouch-cluster`
4. Click **"Create Cluster"**
5. Wait 2-3 minutes for cluster to be created

### **Step 3: Create Database User**

1. Click **"Database Access"** in left menu
2. Click **"Add New Database User"**
3. Fill in:
   - **Username:** `skillvouch-user`
   - **Password:** Generate strong password (save it!)
   - **Database User Privileges:** Read and write to any database
4. Click **"Add User"**

### **Step 4: Whitelist IP Address**

1. Click **"Network Access"** in left menu
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### **Step 5: Get Connection String**

1. Click **"Database"** in left menu
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"6.0 or later"**
5. Copy the connection string

**Your connection string will look like:**
```
mongodb+srv://skillvouch-user:<password>@skillvouch-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### **Step 6: Add MONGODB_URI to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click your project: `skillvouch-hexart`
3. Go to **"Settings"** → **"Environment Variables"**
4. Click **"Add New"**
5. Fill in:
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://skillvouch-user:YOUR_PASSWORD@skillvouch-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - **Environments:** Production, Preview, Development
6. Click **"Save"**

### **Step 7: Deploy and Test**

1. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Convert to MongoDB Atlas"
   git push origin main
   ```

2. **Test the connection:**
   - Health: `https://skillvouch-hexart.vercel.app/api/health`
   - Users: `https://skillvouch-hexart.vercel.app/api/users`

## 🎯 **Expected Results**

**Health Check Response:**
```json
{
  "success": true,
  "message": "MongoDB connection successful",
  "database": "skillvouch",
  "connectionState": "connected",
  "collections": 4,
  "objects": 0,
  "dataSize": 0,
  "storageSize": 32768,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Users API Response:**
```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

## 🔧 **Environment Variables Summary**

**Required in Vercel:**
```
MONGODB_URI=mongodb+srv://skillvouch-user:YOUR_PASSWORD@skillvouch-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Optional (for AI features):**
```
VITE_OPENROUTER_API_KEY=your-openrouter-key
VITE_MISTRAL_API_KEY=your-mistral-key
```

## ✅ **Benefits of MongoDB Atlas**

- ✅ **Free tier** (512MB, enough for development)
- ✅ **No connection issues** on Vercel
- ✅ **Auto-scaling** and backups
- ✅ **Global CDN** for fast access
- ✅ **SSL/TLS** encryption built-in
- ✅ **No server management**

## 🚨 **Troubleshooting**

### **Connection Failed:**
- Check MONGODB_URI is correct
- Verify IP whitelist (0.0.0.0/0)
- Ensure database user has correct permissions
- Check cluster is running (green status)

### **404 Errors:**
- Ensure all API files are in `/api` folder
- Check `package.json` has `"type": "module"`

### **Build Errors:**
- Run `npm install` to install mongoose
- Check all imports are correct

## 🎉 **You're Done!**

Your SkillVouch AI app now uses MongoDB Atlas and will work perfectly on Vercel without any database connection issues!
