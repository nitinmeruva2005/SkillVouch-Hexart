# SkillVouch AI - Quiz Generation Platform

<div align="center">
  <img src="public/skillvouch-logo.png" alt="SkillVouch AI Logo" width="200" height="200">
</div>

A cross-platform AI-powered quiz generation platform that creates personalized assessments based on user skills and requirements. Works seamlessly on **Windows, macOS, and Linux**.

## 🚀 Features

- AI-driven quiz generation using Mistral AI
- Skill assessment and matching
- Real-time quiz creation and evaluation
- Modern React + TypeScript frontend
- Express.js backend with MySQL database
- **Cross-platform compatibility** (Windows, macOS, Linux)

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **AI Services:** Mistral AI, OpenRouter (Llama 3.3 70B)
- **Database:** MySQL (cross-platform support)
- **Icons:** Lucide React
- **Charts:** Recharts

## 📋 Prerequisites

- **Node.js** (v18 or higher) - Works on all platforms
- **npm or yarn** - Package manager
- **MySQL database** - Cross-platform database solution
- **Mistral AI API key**
- **OpenRouter API key** (optional, for Llama 3.3 70B)

## 🌐 Platform Support

This project is designed to work on:
- **Windows 10/11** - Full support with native MySQL
- **macOS** - Full support with Homebrew MySQL
- **Linux** - Full support with package manager MySQL

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd skillvouch-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp backend/.env.example backend/.env
   
   # Edit backend/.env and add your API keys:
   MISTRAL_API_KEY=your-mistral-api-key-here
   VITE_OPENROUTER_API_KEY=your-openrouter-api-key-here
   LLAMA_API_KEY=your-openrouter-api-key-here
   
   # Configure database
   
   ```

4. **Set up your database:**

   **For macOS:**
   ```bash
   # Install MySQL
   brew install mysql
   
   # Start MySQL service
   brew services start mysql
   
   # Login to MySQL
   mysql -u root -p
   
   # Create database
   CREATE DATABASE skillvouch;
   
   # Import the schema
   USE skillvouch;
   SOURCE backend/sql/schema.sql;
   ```
   
   **For Windows:**
   ```bash
   # Download and install MySQL from: https://dev.mysql.com/downloads/mysql/
   # During installation, set root password and note it down
   
   # Open MySQL Command Line Client (from Start Menu)
   # Enter your root password when prompted
   
   # Create database
   CREATE DATABASE skillvouch;
   
   # Import the schema
   USE skillvouch;
   SOURCE C:/path/to/your/project/backend/sql/schema.sql;
   ```

   **For Linux (Ubuntu/Debian):**
   ```bash
   # Install MySQL
   sudo apt update
   sudo apt install mysql-server
   
   # Start MySQL service
   sudo systemctl start mysql
   sudo systemctl enable mysql
   
   # Secure MySQL (optional but recommended)
   sudo mysql_secure_installation
   
   # Login to MySQL
   sudo mysql -u root -p
   
   # Create database
   CREATE DATABASE skillvouch;
   
   # Import the schema
   USE skillvouch;
   SOURCE /path/to/your/project/backend/sql/schema.sql;
   ```

   **For Linux (Fedora/CentOS):**
   ```bash
   # Install MySQL
   sudo dnf install mysql-server
   
   # Start MySQL service
   sudo systemctl start mysqld
   sudo systemctl enable mysqld
   
   # Login to MySQL
   sudo mysql -u root -p
   
   # Create database
   CREATE DATABASE skillvouch;
   
   # Import the schema
   USE skillvouch;
   SOURCE /path/to/your/project/backend/sql/schema.sql;
   ```

5. **Configure database environment variables:**
   ```bash
   # Edit backend/.env and add your database credentials:
   
   ```

6. **Run the application:**
   
   **Start the backend server:**
   ```bash
   cd backend
   node server.js
   ```
   
   **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`
   The backend API will be available at `http://localhost:3000`

## 🚀 Deployment

### 🌟 **EASIEST OPTION: Vercel + GitHub (Recommended)**

## 📋 **Step-by-Step Process**

### **Step 1: Prepare Your Repository**
```bash
# Make sure your code is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **Step 2: Sign up for Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### **Step 3: Import Your Repository**
1. Click "New Project" on Vercel dashboard
2. Find your repository: `nitinmeruva2005/SkillVouch-Hexart`
3. Click "Import"
4. Vercel will automatically detect:
   - Framework: React + Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### **Step 4: Configure Environment Variables**
1. In Vercel project, click "Settings" tab
2. Click "Environment Variables" in left menu
3. Add these variables one by one:

```bash
# Frontend Variables
VITE_MISTRAL_API_KEY=your-mistral-api-key-here

# Backend Variables

MISTRAL_API_KEY=your-mistral-api-key-here
```

### **Step 5: Deploy**
1. Click "Deploy" button
2. Wait for build to complete (2-3 minutes)
3. Your app is now live! 🎉

### **Step 6: Verify Deployment**
1. Visit your live URL: `https://skillvouch-hexart.vercel.app`
2. Test all features:
   - Homepage loads
   - Quiz generation works
   - API endpoints respond

### **Step 7: Future Updates**
```bash
# Any changes you push will auto-deploy
git add .
git commit -m "Update feature"
git push origin main

# Or manual redeploy
vercel --prod
```

## 🔧 **Database Setup for Production**

## 🔧 **Railway MySQL Setup (Complete Guide)**

### 🚀 **Quick Start - Railway MySQL**

#### **Step 1: Create Railway Account**
1. Go to [railway.app](https://railway.app)
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Railway to access your GitHub account
4. Verify your email if prompted

#### **Step 2: Create MySQL Database**
1. In Railway dashboard, click "New Project"
2. Click "Provision MySQL"
3. Wait for database to be created (1-2 minutes)
4. Click on your newly created MySQL database

#### **Step 3: Get Database Credentials**
1. In your MySQL project, click the "Connect" tab
2. Copy the connection details exactly as shown:
```bash
# Example (copy YOUR actual values)
MYSQL_HOST=containers.railway.app
MYSQL_PORT=6543  # Your port will be different
MYSQL_USER=root
MYSQL_PASSWORD=AbCdEfGhIjKlMnOp  # Your generated password
MYSQL_DATABASE=railway
```

#### **Step 4: Import Database Schema**
1. In Railway dashboard, click the "Query" tab
2. Open your local project: `backend/sql/schema.sql`
3. Copy ALL the SQL code from the file
4. Paste into the Railway query editor
5. Click "Execute" (or press Ctrl+Enter)
6. Verify you see "Query executed successfully"

#### **Step 5: Update Vercel Environment Variables**
1. Go to your Vercel project: [vercel.com](https://vercel.com)
2. Click on your "skillvouch-hexart" project
3. Go to "Settings" → "Environment Variables"
4. Add these variables one by one:

| Variable | Value | Example |
|----------|--------|---------|
| `MYSQL_HOST` | Your Railway host | `containers.railway.app` |
| `MYSQL_PORT` | Your Railway port | `6543` |
| `MYSQL_USER` | Database user | `root` |
| `MYSQL_PASSWORD` | Your password | `AbCdEfGhIjKlMnOp` |
| `MYSQL_DATABASE` | Database name | `railway` |

#### **Step 6: Deploy**
1. Click "Deploy" button
2. Wait for build to complete (2-3 minutes)
3. Your app is now live! 🎉

#### **Step 7: Test Database Connection**
1. Visit your app: `https://skillvouch-hexart.vercel.app`
2. Try creating a quiz or user
3. If it works, database is connected! 🎉

### 🔍 **Troubleshooting Railway MySQL**

**"Failed to Fetch Users" Error on Vercel?**

This is the most common issue when deploying to Vercel. Here's how to fix it:

#### **Step 1: Check Vercel Function Logs**
1. Go to Vercel dashboard → "Functions" tab
2. Click on your API functions
3. Look for error messages like:
   - `ECONNREFUSED`
   - `Connection timeout`
   - `Access denied for user`
   - `Database not found`

#### **Step 2: Verify Environment Variables**
1. In Vercel → "Settings" → "Environment Variables"
2. Check each variable is EXACTLY correct:
```bash
# Common mistakes to avoid:
❌ MYSQL_HOST=containers.railway.app  (missing quotes)
✅ MYSQL_HOST=containers.railway.app

❌ MYSQL_PORT= "6543"  (extra quotes)
✅ MYSQL_PORT=6543

❌ MYSQL_PASSWORD=AbCdEfGhIjKlMnOp  (spaces)
✅ MYSQL_PASSWORD=AbCdEfGhIjKlMnOp
```

#### **Step 3: Test Railway Database Status**
1. Go to Railway dashboard
2. Check your MySQL database status:
   - **Green dot** = Running ✅
   - **Yellow dot** = Starting ⏳
   - **Red dot** = Stopped/Paused ❌
3. If paused, click "Resume" button

#### **Step 4: Verify Database Schema**
1. In Railway → "Query" tab
2. Run this command to check tables:
```sql
SHOW TABLES;
```
3. You should see: `users`, `quizzes`, `quiz_attempts`, etc.
4. If no tables, re-import schema.sql

#### **Step 5: Test Connection Manually**
Add this debug endpoint to your backend:
```javascript
// backend/routes/test-db.js
import { query } from '../db.js';

export default async function handler(req, res) {
  try {
    const result = await query('SELECT COUNT(*) as count FROM users');
    res.status(200).json({ 
      success: true, 
      userCount: result[0].count,
      message: 'Database connected successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      envVars: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        database: process.env.MYSQL_DATABASE
      }
    });
  }
}
```

#### **Step 6: Common Fixes**

**Fix 1: Railway Database Paused**
```bash
# Solution: Resume database in Railway dashboard
# Railway auto-pauses after 30 minutes of inactivity
```

**Fix 2: Wrong Port Number**
```bash
# Check Railway "Connect" tab for actual port
# Don't use 3306, use Railway's assigned port
```

**Fix 3: Password Special Characters**
```bash
# If password has special characters, URL encode it:
# Original: P@ssw0rd!
# Encoded: P%40ssw0rd%21
```

**Fix 4: Network Issues**
```bash
# Add SSL configuration to database connection:
const connection = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: {
    rejectUnauthorized: false
  }
}
```

#### **Step 7: Redeploy After Fixes**
```bash
# After making changes:
git add .
git commit -m "Fix database connection"
git push origin main

# Wait for Vercel redeploy (2-3 minutes)
```

#### **Step 8: Final Verification**
1. Visit: `https://skillvouch-hexart.vercel.app/api/test-db`
2. Should return: `{"success": true, "userCount": 0}`
3. If success, try main app again
4. If still fails, check the error response

**Connection Failed?**
- Double-check all environment variables in Vercel
- Ensure Railway database is "Running" (not paused)
- Verify you imported the schema correctly

**Schema Import Failed?**
- Make sure you copied the ENTIRE schema.sql file
- Check for any syntax errors in the SQL
- Try importing table by table if needed

**Vercel Build Errors?**
- Check Vercel function logs for database errors
- Ensure all required variables are set
- Verify Railway database is accessible

### 💡 **Railway Tips**

**Free Tier Limits:**
- 500 hours/month (enough for development)
- 100MB storage (good for starter projects)
- Auto-pauses after inactivity (wakes on request)

**Best Practices:**
- Keep Railway database running during development
- Use Railway's query editor for database management
- Monitor usage in Railway dashboard
- Upgrade to paid plan for production apps

**Connection String Format:**
```bash
# For your backend code
const connection = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}
```

### 🎯 **Railway Dashboard Navigation**

**Main Tabs:**
- **Overview** - Database status and metrics
- **Connect** - Connection credentials
- **Query** - SQL editor and schema management
- **Metrics** - Performance monitoring
- **Settings** - Database configuration

**Important Links:**
- Railway Dashboard: [railway.app](https://railway.app)
- Your Project: Direct link in Railway sidebar
- Support: Railway documentation and Discord

### **Option B: PlanetScale (Free Tier)**

#### **Step 1: Create PlanetScale Account**
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub
3. Create new organization

#### **Step 2: Create Database**
1. Click "Create Database"
2. Name it: `skillvouch`
3. Choose region closest to your users
4. Click "Create Database"

#### **Step 3: Get Connection String**
1. Click "Connect" → "Connect with"
2. Select "@planetScale/database"
3. Copy the connection string

#### **Step 4: Import Schema**
1. Download PlanetScale CLI
2. Run: `pscale shell skillvouch main`
3. Copy-paste schema.sql content
4. Execute to create tables

#### **Step 5: Update Vercel Variables**
```bash
# PlanetScale format
MYSQL_HOST=aws.connect.psdb.cloud
MYSQL_PORT=3306
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=skillvouch
```

### **Option C: Supabase (PostgreSQL Alternative)**

#### **Step 1: Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Connect with GitHub
4. Create new project

#### **Step 2: Get Database URL**
1. In Supabase dashboard, click "Settings" → "Database"
2. Copy the "Connection string"
3. Format for MySQL variables

#### **Step 3: Update Vercel Variables**
```bash
# Supabase format (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/dbname
```

## 🔄 **Testing Database Connection**

### **Step 1: Deploy with Database**
1. After adding database variables to Vercel
2. Push changes: `git push origin main`
3. Wait for deployment to complete

### **Step 2: Test API Endpoints**
```bash
# Test database connection
curl https://skillvouch-hexart.vercel.app/api/health

# Test quiz generation
curl -X POST https://skillvouch-hexart.vercel.app/api/quiz \
  -H "Content-Type: application/json" \
  -d '{"skill": "JavaScript", "difficulty": "beginner"}'
```

### **Step 3: Check Vercel Logs**
1. Go to Vercel dashboard → "Functions" tab
2. Click on your API functions
3. Check logs for database connection errors
4. Debug any connection issues

## 🎯 **Recommended Setup**

**For Beginners:** Railway MySQL
- ✅ Easiest setup
- ✅ Free tier available
- ✅ Good documentation
- ✅ MySQL compatible

**For Production:** PlanetScale
- ✅ Serverless scaling
- ✅ Branching support
- ✅ Excellent performance
- ✅ Free tier available

**For Full-Stack:** Supabase
- ✅ Authentication included
- ✅ Real-time features
- ✅ PostgreSQL (more features)
- ✅ Free tier available

## 🎯 **What You Get**

✅ **Live URL:** `https://skillvouch-hexart.vercel.app`  
✅ **API Endpoints:** `https://skillvouch-hexart.vercel.app/api/*`  
✅ **Free SSL Certificate**  
✅ **Global CDN**  
✅ **Automatic Deployments**  
✅ **Custom Domain Support**  

## 🆘 **Troubleshooting**

**Build Fails?**
- Check environment variables are correct
- Ensure all dependencies are in package.json
- Check build logs in Vercel dashboard

**API Not Working?**
- Verify database connection string
- Check backend environment variables
- Look at function logs in Vercel

**Frontend Not Loading?**
- Check Vite base URL in vite.config.ts
- Verify build completed successfully
- Clear browser cache

---

### **Option 1: GitHub Pages (Frontend) + Railway/Render (Backend)**

**Step 1: Update vite.config.ts for GitHub Pages**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/skillvouch-hexart/', // Replace with your repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

**Step 2: Deploy Frontend to GitHub Pages**
```bash
# Build the project
npm run build

# Add and push to GitHub
git add dist/
git commit -m "Add built frontend"
git push origin main

# Enable GitHub Pages in repository settings:
# Go to Settings > Pages > Source: Deploy from a branch
# Select branch: main, folder: /dist
```

**Step 3: Deploy Backend to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Add environment variables in Railway dashboard
```

### **Option 2: GitHub Actions + Vercel**

**Step 1: Create .github/workflows/deploy.yml**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build frontend
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

**Step 2: Add Vercel secrets to GitHub**
```bash
# In GitHub repository settings > Secrets and variables > Actions
# Add: VERCEL_TOKEN, ORG_ID, PROJECT_ID
```

### **Option 3: GitHub Codespaces + Cloud Deployment**

**Step 1: Create .devcontainer/devcontainer.json**
```json
{
  "name": "SkillVouch AI",
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",
  "forwardPorts": [3000, 5173],
  "postCreateCommand": "npm install && cd backend && npm install"
}
```

**Step 2: Create docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "5173:5173"
    volumes:
      - .:/workspace
    environment:
      - NODE_ENV=development
```

### **Option 4: GitHub Packages + Docker**

**Step 1: Create .github/workflows/docker.yml**
```yaml
name: Build and Deploy Docker

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
```

**Step 2: Deploy from GitHub Container Registry**
```bash
# Pull and run on any server
docker pull ghcr.io/nitinmeruva2005/skillvouch-hexart:latest
docker run -p 3000:3000 ghcr.io/nitinmeruva2005/skillvouch-hexart:latest
```

### **GitHub Repository Setup**

**1. Enable GitHub Pages:**
- Go to repository Settings > Pages
- Source: Deploy from a branch
- Branch: main, folder: /dist

**2. Configure GitHub Secrets:**
- Go to Settings > Secrets and variables > Actions
- Add all API keys and database credentials

**3. Set up Branch Protection:**
- Go to Settings > Branches
- Add rule for main branch
- Require pull request reviews
- Require status checks to pass

**4. Enable GitHub Actions:**
- Actions are automatically enabled
- Monitor workflow runs in Actions tab

### **Environment Variables for GitHub Deployment**

**GitHub Secrets:**
```bash
# Frontend
VITE_OPENROUTER_API_KEY
VITE_MISTRAL_API_KEY

# Backend
MYSQL_HOST
MYSQL_PORT
MYSQL_USER
MYSQL_PASSWORD
MYSQL_DATABASE
MISTRAL_API_KEY

# Deployment
VERCEL_TOKEN
ORG_ID
PROJECT_ID
GITHUB_TOKEN
```

### **Option 5: Vercel + GitHub Integration (Easiest)**

**Step 1: Connect GitHub to Vercel**
1. Go to vercel.com
2. Click "New Project"
3. Import GitHub repository
4. Vercel auto-detects settings

**Step 2: Configure Vercel**
```bash
# vercel.json (auto-created by Vercel)
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/server.js" },
    { "src": "/(.*)", "dest": "/dist/$1" }
  ]
}
```

**Step 3: Deploy**
```bash
# Automatic deployment on git push
git push origin main

# Or manual deployment
vercel --prod
```

### **Option 1: Vercel (Frontend) + Railway/Heroku (Backend)**

**Frontend Deployment (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod
```

**Backend Deployment (Railway):**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## � Deployment

### **Option 1: Vercel (Frontend) + Railway/Heroku (Backend)**

**Frontend Deployment (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod
```

**Backend Deployment (Railway):**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### **Option 2: Netlify (Frontend) + Render (Backend)**

**Frontend Deployment (Netlify):**
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

**Backend Deployment (Render):**
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && node server.js`
5. Add environment variables in Render dashboard

### **Option 3: Docker Deployment**

**Create Dockerfile:**
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
COPY --from=frontend-build /app/dist ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

**Deploy with Docker:**
```bash
# Build and run locally
docker build -t skillvouch-ai .
docker run -p 3000:3000 skillvouch-ai

# Deploy to cloud services (AWS, Google Cloud, etc.)
```

### **Option 4: Full-Stack Vercel Deployment**

**Update vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

### **Environment Variables for Production**

**Required Environment Variables:**
```bash
# Frontend
VITE_OPENROUTER_API_KEY=your-openrouter-api-key
VITE_MISTRAL_API_KEY=your-mistral-api-key

# Backend
MYSQL_HOST=your-production-db-host
MYSQL_PORT=3306
MYSQL_USER=your-db-user
MYSQL_PASSWORD=your-db-password
MYSQL_DATABASE=skillvouch
MISTRAL_API_KEY=your-mistral-api-key
```

### **Database Deployment**

**Option A: Railway/Render MySQL**
- Use managed MySQL service from Railway or Render
- Update connection string in environment variables

**Option B: PlanetScale**
```bash
# Sign up at planetscale.com
# Create database and get connection string
# Update environment variables
```

**Option C: AWS RDS**
- Create RDS MySQL instance
- Configure security groups
- Update environment variables

## �� Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📝 Environment Variables

### Required API Keys

1. **Mistral AI API Key:**
   - Get your key from: https://console.mistral.ai/
   - Used for quiz generation

2. **OpenRouter API Key (Optional):**
   - Get your free key from: https://openrouter.ai/settings/keys
   - Provides access to Llama 3.3 70B with generous free limits

### Database Configuration

Make sure your MySQL server is running and the database credentials in `backend/.env` are correct.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
- Check the existing issues
- Create a new issue with detailed information
- Include your environment details and error messages

---

**Note:** This project uses AI services that may require API keys with associated costs. Please check the pricing details for each service before usage.
