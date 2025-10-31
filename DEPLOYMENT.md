# Deployment Guide - RuleFlow Demo on Render

This guide walks you through deploying both the frontend and backend to Render independently.

## Prerequisites

- GitHub account with the ruleflow-demo repository pushed
- Render account (free at [render.com](https://render.com))

---

## Option 1: Automated Deployment with render.yaml (Recommended)

If you have the `render.yaml` file in your repository root, Render can deploy both services automatically.

### Steps

1. **Push to GitHub**
   ```bash
   git add render.yaml backend/.env.example frontend/.env.example
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the branch (usually `main`)
   - Click "Create New Blueprint"

3. **Render will automatically deploy:**
   - Backend as a Web Service
   - Frontend as a Static Site

4. **Update Environment Variables**
   - After deployment completes, you'll have two service URLs
   - Go to Backend service → Environment Variables
   - Update `FRONTEND_URL` with your frontend URL: `https://your-frontend-name.onrender.com`
   - Save changes (backend will redeploy)

---

## Option 2: Manual Deployment (Step-by-Step)

If you prefer to deploy each service separately, follow these steps.

### Deploy Backend First

1. **Create a Web Service**
   - Dashboard → New Web Service
   - Connect your GitHub repository
   - Select root directory: `/backend`
   - Name: `ruleflow-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Add Environment Variables**
   - Click "Environment"
   - Add these variables:
     ```
     PORT = 3001
     NODE_ENV = production
     FRONTEND_URL = (leave blank for now, update after frontend is deployed)
     ```
   - Click "Create Web Service"

3. **Wait for deployment** (2-5 minutes)
   - You'll see a green checkmark when complete
   - Note your backend URL: `https://your-backend-name.onrender.com`

### Deploy Frontend

1. **Create a Static Site**
   - Dashboard → New Static Site
   - Connect your GitHub repository
   - Select root directory: `/frontend`
   - Name: `ruleflow-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Add Environment Variables**
   - Click "Environment"
   - Add this variable:
     ```
     VITE_API_URL = https://your-backend-name.onrender.com
     ```
   - Click "Create Static Site"

3. **Wait for deployment** (2-5 minutes)
   - You'll see a green checkmark when complete
   - Note your frontend URL: `https://your-frontend-name.onrender.com`

### Update Backend CORS

1. **Go back to Backend service**
   - Click "Environment" → Edit
   - Update `FRONTEND_URL` to your frontend URL
   - Save changes (backend will redeploy automatically)

---

## Project Structure for Render

```
ruleflow-demo/
├── render.yaml                    # Render configuration
├── backend/
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   ├── src/
│   │   └── server.js             # Entry point (looks for PORT env var)
│   └── rules/
│       └── loyalty-rules.json     # Rules configuration
└── frontend/
    ├── .env.example              # Environment variables template
    ├── package.json
    ├── vite.config.js            # Uses VITE_API_URL
    └── src/
        └── ...
```

---

## Environment Variables Explained

### Backend (`PORT`, `NODE_ENV`, `FRONTEND_URL`)

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | `3001` | Server port (Render assigns one if not specified) |
| `NODE_ENV` | `production` | Optimizes for production |
| `FRONTEND_URL` | `https://your-frontend-name.onrender.com` | CORS - allows frontend to make requests |

### Frontend (`VITE_API_URL`)

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | `https://your-backend-name.onrender.com` | API endpoint for all requests |

---

## Free Tier Considerations

**Render's Free Plan includes:**
- ✅ Automatic deployments on git push
- ✅ SSL/TLS certificates
- ✅ Basic monitoring
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ First request after inactivity takes 30-60 seconds

**To keep services warm:**
- Use Render's cron jobs (paid feature)
- Or use an external uptime monitor

---

## Testing Your Deployment

### Test Backend Health
```bash
curl https://your-backend-name.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T...",
  "rulesLoaded": 9
}
```

### Test Frontend
- Open `https://your-frontend-name.onrender.com` in browser
- Try the calculator
- Check browser console for any API errors

### Test API Calls
```bash
curl -X POST https://your-backend-name.onrender.com/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"tier":"gold","total_spend":6000}'
```

---

## Troubleshooting

### Frontend shows "Cannot POST /api/calculate"
- **Cause**: `VITE_API_URL` not set or incorrect
- **Fix**: Check frontend environment variables, ensure it points to backend URL

### CORS errors in browser console
- **Cause**: `FRONTEND_URL` on backend doesn't match actual frontend URL
- **Fix**: Update backend `FRONTEND_URL` environment variable and redeploy

### Rules file not found
- **Cause**: File path is relative and deployment structure differs
- **Fix**: Backend uses `../rules/loyalty-rules.json` from `backend/src/server.js`

### Services keep spinning down
- **Cause**: Free tier inactivity limit
- **Solution**: Upgrade to paid plan or use external monitor

---

## Updating Rules in Production

Currently, rules are stored in `backend/rules/loyalty-rules.json`.

**To update rules:**

1. Edit the file locally
2. Commit and push to GitHub
3. Render automatically redeploys backend
4. Changes take effect immediately

**For database-backed rules** (recommended for future):
- Add PostgreSQL/MongoDB to Render
- Update backend to read from database instead of file
- Add admin API endpoint for rule updates

---

## Next Steps

1. ✅ Push `render.yaml` to GitHub
2. ✅ Connect repository to Render
3. ✅ Deploy both services
4. ✅ Update environment variables
5. ✅ Test both services
6. ✅ Share your deployed URLs!

---

## Useful Links

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Static Sites on Render](https://render.com/docs/static-sites)
- [Environment Variables](https://render.com/docs/environment-variables)

---

**Happy deploying! 🚀**
