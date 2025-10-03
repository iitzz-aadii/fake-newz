# 🚀 TruthLens Setup Guide - Real Internet Data Access

This guide will help you set up real internet data access for your fake news detection system. Choose the option that best fits your needs!

## 📋 **Quick Overview**

Your TruthLens app now supports **4 different ways** to access real internet data:

1. **🔥 Frontend + API Keys** (Easiest - No backend needed)
2. **🖥️ Your Own Backend Server** (Full control)
3. **☁️ Supabase Integration** (Cloud database)
4. **🔗 External Fact-Checking APIs** (Professional services)

---

## 🔥 **Option 1: Frontend + API Keys (Recommended)**

### **Step 1: Get API Keys**

**A) NewsAPI (for URL content fetching):**

1. Go to [https://newsapi.org](https://newsapi.org)
2. Sign up for free account
3. Get your API key (50 requests/day free)

**B) OpenAI (for AI analysis):**

1. Go to [https://openai.com](https://openai.com)
2. Create account and add payment method
3. Get API key from dashboard
4. Cost: ~$0.01-0.05 per analysis

### **Step 2: Configure Your App**

Edit `script.js` and update these lines:

```javascript
// Real API Integration Configuration
const API_CONFIG = {
  newsApiKey: "your-actual-newsapi-key-here", // Replace this
  openAiKey: "your-actual-openai-key-here", // Replace this
  useRealAPI: true, // Set to true to enable
};
```

### **Step 3: Test It!**

1. Run your app: `npm start`
2. Paste a news article or URL
3. Click "Check Authenticity"
4. You should see "Real API integration active!" message

**✅ Pros:** Simple setup, no backend needed
**❌ Cons:** API keys visible in frontend (use environment variables in production)

---

## 🖥️ **Option 2: Your Own Backend Server**

### **Step 1: Install Dependencies**

```bash
npm install express cors axios cheerio
```

### **Step 2: Set Environment Variables**

Create a `.env` file:

```bash
# .env file
NEWSAPI_KEY=your-newsapi-key
OPENAI_API_KEY=your-openai-key
ENABLE_SCRAPING=true
PORT=3001
```

### **Step 3: Start the Backend**

```bash
# Start the backend server
npm run server

# Or with auto-reload during development
npm install -g nodemon
npm run server:dev
```

### **Step 4: Update Frontend Configuration**

In `script.js`, update the API endpoint:

```javascript
const API_ENDPOINT = "http://localhost:3001/check-news";
```

### **Step 5: Test the Setup**

1. Backend should be running on `http://localhost:3001`
2. Frontend on `http://localhost:3000`
3. Check health: `http://localhost:3001/health`

**✅ Pros:** Secure API keys, web scraping, full control
**❌ Cons:** Requires backend server management

---

## ☁️ **Option 3: Supabase Integration**

### **Step 1: Create Supabase Project**

1. Go to [https://supabase.com](https://supabase.com)
2. Create new project
3. Note your Project URL and API Key

### **Step 2: Create Database Table**

In Supabase SQL Editor, run:

```sql
-- Create analyses table
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations" ON analyses
FOR ALL USING (true);
```

### **Step 3: Configure Your App**

In `script.js`, update:

```javascript
const SUPABASE_URL = "your-project-url";
const SUPABASE_ANON_KEY = "your-anon-key";
```

**✅ Pros:** Cloud storage, real-time sync, scalable
**❌ Cons:** Additional service dependency

---

## 🔗 **Option 4: External Fact-Checking APIs**

### **Available Services:**

**A) ClaimBuster API (Free tier available):**

- URL: `https://idir.uta.edu/claimbuster/api/v2`
- Free tier: 100 requests/day

**B) Google Fact Check Tools API:**

- Requires Google Cloud account
- Pay-per-use pricing

**C) Full Fact API:**

- Professional fact-checking service
- Contact for pricing

### **Implementation Example:**

```javascript
// Using ClaimBuster (already included in api-integration.js)
const factChecker = new FactCheckingService();
const result = await factChecker.checkClaims(articleText);
```

---

## 🛠️ **Development Workflow**

### **1. Start with Mock Data**

```bash
npm start
# Test with demo data first
```

### **2. Add API Keys Gradually**

```javascript
// Start with one service
const API_CONFIG = {
  newsApiKey: "YOUR_NEWSAPI_KEY",
  openAiKey: "your-real-key-here", // Add OpenAI first
  useRealAPI: true,
};
```

### **3. Test Each Component**

- Test URL fetching
- Test AI analysis
- Test database storage
- Test error handling

### **4. Production Deployment**

- Use environment variables for API keys
- Enable HTTPS
- Set up proper CORS
- Monitor API usage and costs

---

## 🔧 **Troubleshooting**

### **Common Issues:**

**1. CORS Errors:**

```javascript
// Add to your backend
app.use(
  cors({
    origin: "https://your-frontend-domain.com",
  })
);
```

**2. API Rate Limits:**

- NewsAPI: 50 requests/day (free)
- OpenAI: Pay-per-use
- Implement caching to reduce calls

**3. URL Scraping Fails:**

- Some sites block scraping
- Use NewsAPI as fallback
- Implement retry logic

**4. API Keys Not Working:**

- Check key format and permissions
- Verify billing setup (OpenAI)
- Check rate limits

### **Debug Mode:**

Enable detailed logging:

```javascript
// In script.js
const DEBUG_MODE = true;

if (DEBUG_MODE) {
  console.log("API Config:", API_CONFIG);
  console.log("Analysis result:", result);
}
```

---

## 💰 **Cost Estimation**

### **Free Tier Usage:**

- NewsAPI: 50 requests/day = FREE
- ClaimBuster: 100 requests/day = FREE
- Supabase: 500MB database = FREE

### **Paid Usage:**

- OpenAI: $0.01-0.05 per analysis
- NewsAPI Pro: $449/month (unlimited)
- Google Fact Check: Pay-per-use

### **Monthly Cost Examples:**

- **Light usage** (100 analyses): ~$5/month
- **Medium usage** (1000 analyses): ~$50/month
- **Heavy usage** (10k analyses): ~$500/month

---

## 🚀 **Next Steps**

1. **Choose your preferred option** from above
2. **Get the required API keys**
3. **Update the configuration**
4. **Test with real articles**
5. **Deploy to production**

### **Production Checklist:**

- [ ] API keys secured with environment variables
- [ ] HTTPS enabled
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 📞 **Need Help?**

If you run into issues:

1. Check the browser console for errors
2. Test the `/health` endpoint if using backend
3. Verify API key permissions
4. Check network connectivity
5. Review the troubleshooting section above

**Your TruthLens app is now ready for real-world fake news detection! 🎉**
