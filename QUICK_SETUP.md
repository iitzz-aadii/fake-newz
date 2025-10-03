# 🚀 Quick Setup Guide - Your API Key is Ready!

## ✅ API Key Status

Your Gemini API key `AIzaSyBxwhKOd9NnB_CCQ-0zF14srNLxEkPLBhc` has been tested and is **WORKING PERFECTLY**!

## 🎯 Next Steps to Deploy

### 1. Update Your .env File

Since the `.env` file is protected, you need to manually update it:

```bash
# Open .env file and change this line:
GEMINI_API_KEY=AIzaSyBxwhKOd9NnB_CCQ-0zF14srNLxEkPLBhc
```

### 2. Deploy to Netlify

#### Option A: GitHub + Netlify (Recommended)

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Deploy on Netlify**:

   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build settings:
     - Build command: `npm install`
     - Publish directory: `.`
     - Functions directory: `netlify/functions`

3. **Set Environment Variable**:
   - In Netlify dashboard → Site settings → Environment variables
   - Add: `GEMINI_API_KEY` = `AIzaSyBxwhKOd9NnB_CCQ-0zF14srNLxEkPLBhc`

#### Option B: Direct Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir .
```

### 3. Test Your Deployment

Once deployed, test your app:

1. Visit your Netlify URL
2. Paste a news article or URL
3. Click "Check Authenticity"
4. Verify AI analysis is working

## 🔧 Local Testing (Optional)

```bash
# Test with Netlify Functions locally
npm run netlify:dev

# Or test with your local server
npm start
```

## 📋 What's Already Configured

- ✅ Netlify configuration (`netlify.toml`)
- ✅ Serverless function (`netlify/functions/check-news.js`)
- ✅ API integration (`netlify-api-integration.js`)
- ✅ Environment setup (`.env` template)
- ✅ Build scripts (`package.json`)
- ✅ Git ignore rules (`.gitignore`)

## 🎉 You're Ready to Deploy!

Your TruthLens app is fully configured and ready for production deployment. The AI analysis will work immediately once deployed with your API key.

**Your app will be live at**: `https://your-site-name.netlify.app`

Need help? Check the detailed guide in `NETLIFY_DEPLOYMENT.md`
