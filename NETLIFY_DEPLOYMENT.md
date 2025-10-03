# Netlify Deployment Guide for TruthLens

This guide will help you deploy your TruthLens fake news detection app to Netlify.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Google Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 1: Prepare Your Repository

### 1.1 Environment Variables
Create a `.env` file in your project root (this will be ignored by git):

```bash
# Copy from env.example
cp env.example .env
```

Edit `.env` and add your actual API keys:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 1.2 Test Locally (Optional)
Install Netlify CLI and test locally:
```bash
npm install -g netlify-cli
netlify dev
```

## Step 2: Deploy to Netlify

### Method 1: Connect GitHub Repository (Recommended)

1. **Go to Netlify Dashboard**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"

2. **Connect GitHub**
   - Choose "GitHub" as your Git provider
   - Authorize Netlify to access your repositories
   - Select your `fake-newz` repository

3. **Configure Build Settings**
   - **Build command**: `npm install`
   - **Publish directory**: `.` (current directory)
   - **Functions directory**: `netlify/functions`

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following variables:
     ```
     GEMINI_API_KEY = your_actual_gemini_api_key_here
     ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete

### Method 2: Manual Deploy

1. **Build your site locally**:
   ```bash
   npm install
   ```

2. **Deploy via Netlify CLI**:
   ```bash
   netlify deploy --prod --dir .
   ```

## Step 3: Configure Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS settings as instructed by Netlify

## Step 4: Verify Deployment

1. **Test the main functionality**:
   - Visit your deployed site
   - Try analyzing a news article
   - Check if the API is working

2. **Check Netlify Functions**:
   - Go to Functions tab in Netlify dashboard
   - Verify `check-news` function is deployed
   - Check function logs for any errors

## Environment Variables Required

Set these in Netlify Dashboard → Site settings → Environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `OPENAI_API_KEY` | OpenAI API key (fallback) | No |
| `NEWS_API_KEY` | NewsAPI key (for URL fetching) | No |
| `SUPABASE_URL` | Supabase project URL | No |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | No |

## Troubleshooting

### Common Issues

1. **Function not working**:
   - Check environment variables are set correctly
   - Verify function logs in Netlify dashboard
   - Ensure API keys are valid

2. **Build failures**:
   - Check build logs in Netlify dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

3. **CORS errors**:
   - The function already includes CORS headers
   - Check if the function is accessible at `/.netlify/functions/check-news`

### Getting API Keys

1. **Google Gemini API**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy and paste into Netlify environment variables

2. **OpenAI API** (optional):
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add to environment variables

## Post-Deployment

1. **Update your README** with the live URL
2. **Test all functionality** thoroughly
3. **Monitor function logs** for any issues
4. **Set up custom domain** if desired

## File Structure

Your deployed site will have this structure:
```
/
├── index.html (main page)
├── styles.css (styling)
├── script.js (frontend logic)
├── netlify-api-integration.js (API integration)
├── .netlify/functions/check-news.js (serverless function)
└── netlify.toml (Netlify configuration)
```

## Support

If you encounter issues:
1. Check Netlify function logs
2. Verify environment variables
3. Test API keys independently
4. Check browser console for errors

Your TruthLens app should now be live and ready to detect fake news! 🚀
