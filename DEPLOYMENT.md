# Deployment Guide - RuleFlow Demo

This guide walks you through deploying the backend to Railway and frontend to Render.

## Prerequisites

- GitHub account with the ruleflow-demo repository pushed
- Railway account (free at [railway.app](https://railway.app))
- Render account for frontend (free at [render.com](https://render.com))

---

## Deployment Architecture

```
Backend (Node.js) → Railway (Docker)
Frontend (React) → Render (Static Site)
```

---

## Option 1: Deploy Backend to Railway (Docker)

Railway uses Docker for deployment, which ensures consistency across environments.

### Prerequisites for Railway

1. **GitHub Repository Connected**
   - Code pushed to GitHub
   - Railway can access the repository

2. **Required Files** (already created)
   - `Dockerfile` - Docker build configuration
   - `.dockerignore` - Files to exclude from Docker build
   - `railway.toml` - Railway-specific settings
   - `backend/package.json` - Dependencies and start command

### Steps to Deploy on Railway

1. **Push Configuration Files to GitHub**
   ```bash
   git add Dockerfile .dockerignore railway.toml
   git commit -m "Add Railway Docker configuration"
   git push origin main
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account and select `ruleflow-demo` repository
   - Select the branch (usually `main`)

3. **Configure Railway Settings**
   - Railway will auto-detect the Dockerfile
   - Set root directory to `/backend` (if needed)
   - Configure build settings:
     - **Build Command**: Automatic (uses Dockerfile)
     - **Start Command**: Automatic (uses Dockerfile CMD)

4. **Add Environment Variables**
   - In Railway dashboard, go to Variables section
   - Add these variables:
     ```
     PORT=3001
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-name.onrender.com
     ```
   - Replace with your actual Render frontend URL

5. **Deploy**
   - Click "Deploy" button
   - Wait for deployment to complete (2-5 minutes)
   - Note your Railway backend URL: `https://your-railway-backend-url.up.railway.app`

### Railway Free Tier Benefits

✅ **Advantages:**
- No automatic spin-down like Render
- Docker-based deployment (consistent environments)
- Automatic deployments on git push
- SSL/TLS certificates included
- Better uptime on free tier

---

## Option 2: Deploy Frontend to Render (Already Configured)

Your frontend is already deployed on Render. If you need to update the backend URL or redeploy:

1. **Go to Render Dashboard**
   - Select your frontend service
   - Click "Environment"

2. **Update API URL (if needed)**
   - Set `VITE_API_URL` to your Railway backend URL
   - Changes take effect on next deployment

3. **Trigger Redeploy**
   - Push changes to GitHub, or
   - Click "Manual Deploy" in Render dashboard

---

## Project Structure for Railway + Render

```
ruleflow-demo/
├── Dockerfile                      # Docker build (backend)
├── railway.toml                    # Railway config
├── backend/
│   ├── Dockerfile                 # Multi-stage Docker build
│   ├── .dockerignore              # Files to exclude from Docker
│   ├── .env.example               # Environment variables template
│   ├── package.json               # Node 18+ required
│   ├── src/
│   │   └── server.js              # Entry point (uses PORT env var)
│   └── rules/
│       └── loyalty-rules.json      # Rules configuration
└── frontend/
    ├── .env.example               # Environment variables template
    ├── package.json
    ├── vite.config.js             # Uses VITE_API_URL
    └── src/
        └── ...
```

---

## Environment Variables Explained

### Backend on Railway (`PORT`, `NODE_ENV`, `FRONTEND_URL`)

| Variable | Value | Purpose |
|----------|-------|---------| 
| `PORT` | `3001` | Server port (optional, Railway auto-assigns) |
| `NODE_ENV` | `production` | Optimizes for production |
| `FRONTEND_URL` | `https://your-frontend-name.onrender.com` | CORS - allows frontend to make requests |

### Frontend on Render (`VITE_API_URL`)

| Variable | Value | Purpose |
|----------|-------|---------| 
| `VITE_API_URL` | `https://your-railway-backend-url.up.railway.app` | API endpoint for all requests |

---

## Free Tier Considerations

**Railway's Free Plan:**
- ✅ No spin-down on inactivity (better than Render!)
- ✅ Automatic deployments on git push
- ✅ SSL/TLS certificates included
- ✅ Docker-based (consistent environments)
- $5/month free credits
- Better uptime guarantee

**Render's Free Plan (for Frontend):**
- ✅ Automatic deployments on git push
- ✅ SSL/TLS certificates
- ⚠️ Services spin down after 15 minutes of inactivity

**Recommendation:** Keep frontend on Render (static sites are free), backend on Railway (no spin-down concerns)

---

## Testing Your Deployment

### Test Railway Backend Health
```bash
curl https://your-railway-backend-url.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T...",
  "rulesLoaded": 9
}
```

### Test Render Frontend
- Open `https://your-frontend-name.onrender.com` in browser
- Try the calculator
- Check browser console for any API errors

### Test API Integration
```bash
curl -X POST https://your-railway-backend-url.up.railway.app/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"tier":"gold","total_spend":6000}'
```

Expected response:
```json
{
  "success": true,
  "input": {"tier": "gold", "total_spend": 6000},
  "output": {...},
  "appliedRules": [...]
}
```

---

## Troubleshooting

### Railway Deployment Issues

**Build fails with "npm not found"**
- **Cause**: Dockerfile issue or missing Node.js
- **Fix**: Check Dockerfile syntax, ensure `FROM node:18-alpine`

**Port not accessible**
- **Cause**: Port binding issue in Railway
- **Fix**: Railway auto-assigns PORT, ensure backend uses `process.env.PORT`

**Health check failing**
- **Cause**: Health endpoint returning non-200 status
- **Fix**: Check `/api/health` endpoint works locally

### Frontend Integration Issues

**Frontend shows "Cannot POST /api/calculate"**
- **Cause**: `VITE_API_URL` not set or incorrect
- **Fix**: Check frontend environment variables in Render, ensure it points to Railway backend URL

**CORS errors in browser console**
- **Cause**: `FRONTEND_URL` on backend doesn't match actual Render frontend URL
- **Fix**: Update backend `FRONTEND_URL` in Railway environment variables and redeploy

**Rules file not found**
- **Cause**: File path is relative and deployment structure differs
- **Fix**: Backend uses `../rules/loyalty-rules.json` from `backend/src/server.js`

### Docker Build Issues

**Build times out**
- **Cause**: npm install taking too long
- **Fix**: Check Dockerfile uses multi-stage build (already configured)

**Image too large**
- **Cause**: node_modules included in final image
- **Fix**: Dockerfile already uses multi-stage build to prevent this

---

## Updating Rules in Production

Currently, rules are stored in `backend/rules/loyalty-rules.json`.

**To update rules:**

1. Edit the file locally
2. Commit and push to GitHub
3. Railway automatically rebuilds and redeploys backend
4. Changes take effect after redeploy (1-2 minutes)

**For database-backed rules** (recommended for future):
- Add PostgreSQL to Railway (easy one-click addon)
- Update backend to read from database instead of file
- Add admin API endpoint for rule updates

---

## Deployment Checklist

### Railway Backend Deployment
- [ ] Push Docker files to GitHub (Dockerfile, .dockerignore, railway.toml)
- [ ] Create Railway project and connect GitHub
- [ ] Set environment variables (PORT, NODE_ENV, FRONTEND_URL)
- [ ] Trigger deployment and wait for completion
- [ ] Test `/api/health` endpoint
- [ ] Note Railway backend URL

### Render Frontend Configuration
- [ ] Update `VITE_API_URL` in Render environment (if needed)
- [ ] Trigger frontend redeploy
- [ ] Test frontend loads and connects to Railway backend
- [ ] Test calculator functionality end-to-end

### Post-Deployment
- [ ] Monitor Railway logs for errors
- [ ] Test from production frontend to production backend
- [ ] Document final URLs

---

## Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Railway Start Guide](https://docs.railway.app/guides/start)
- [Docker Basics](https://docs.docker.com/get-started/)
- [Node.js on Railway](https://docs.railway.app/guides/dockerize-nodejs-app)
- [Render Documentation](https://render.com/docs)
- [Environment Variables](https://render.com/docs/environment-variables)

---

**Happy deploying! 🚀**
