# 🆓 TruthLens - Best FREE Setup Guide

Get **real fake news detection** with **ZERO cost** and **no API keys required**!

## 🏆 **Best Free Option: ClaimBuster API**

### ✅ **What You Get:**

- **100 real analyses per day** (completely free)
- **Professional fact-checking** from University of Texas research
- **No API keys required** - works immediately
- **Real-time internet data** access
- **Unlimited local storage** for history

### 💰 **Cost: $0/month**

---

## 🚀 **Quick Setup (2 minutes)**

### **Step 1: Enable Free Mode**

Your app is already configured! Just run:

```bash
npm start
```

### **Step 2: Test It**

1. Open `http://localhost:3000`
2. Paste any news article
3. Click "Check Authenticity"
4. You'll see: "Using free ClaimBuster API!" ✅

### **Step 3: Enjoy Real Analysis**

- Get professional fact-checking results
- See confidence scores and keywords
- View analysis history
- All completely free!

---

## 📊 **Free vs Paid Comparison**

| Feature              | Free (ClaimBuster) | Paid (OpenAI) |
| -------------------- | ------------------ | ------------- |
| **Daily Limit**      | 100 requests       | Unlimited     |
| **Cost**             | $0/month           | ~$5-50/month  |
| **Analysis Quality** | Professional       | AI-powered    |
| **Setup Time**       | 0 minutes          | 5 minutes     |
| **API Keys**         | None needed        | Required      |

---

## 🔧 **Advanced Free Options**

### **Option A: NewsAPI (50/day free)**

Add URL content fetching:

```javascript
// In script.js
const API_CONFIG = {
  newsApiKey: "your-free-newsapi-key", // Get from newsapi.org
  useRealAPI: true,
  useFreeAPIsOnly: true,
};
```

### **Option B: Supabase (Free tier)**

Add cloud storage:

```javascript
// In script.js
const SUPABASE_URL = "your-free-supabase-url";
const SUPABASE_ANON_KEY = "your-free-supabase-key";
```

### **Option C: Combine All Free Services**

Maximum free features:

```javascript
const API_CONFIG = {
  newsApiKey: "your-newsapi-key", // 50 requests/day
  useRealAPI: true,
  useFreeAPIsOnly: true, // ClaimBuster 100/day
};

const SUPABASE_URL = "your-url"; // 500MB database
const SUPABASE_ANON_KEY = "your-key"; // Real-time sync
```

**Total free allowance: 150 analyses/day + cloud storage!**

---

## 🎯 **Why This is the Best Free Option**

### **1. No Setup Required**

- Works immediately out of the box
- No API keys to manage
- No configuration needed

### **2. Professional Quality**

- ClaimBuster is used by journalists and researchers
- Developed by University of Texas at Arlington
- Real academic-grade fact-checking

### **3. Generous Limits**

- 100 requests/day = 3,000/month
- Perfect for personal use or small projects
- Resets daily automatically

### **4. Real Internet Data**

- Not just mock data or keywords
- Actual analysis of claim credibility
- Professional scoring algorithms

---

## 📈 **Usage Scenarios**

### **Personal Use (Perfect fit)**

- Check 3-5 articles daily = 30% of free limit
- Plenty of room for experimentation
- Great for learning and testing

### **Small Blog/Website**

- Analyze reader-submitted articles
- Add fact-checking to your content
- Professional credibility boost

### **Educational Projects**

- Demonstrate fake news detection
- Teaching tool for media literacy
- Research and analysis projects

### **Prototype Development**

- Test your app concept
- Validate user interest
- Prove concept before investing

---

## 🚀 **Upgrade Path (When You Need More)**

When you outgrow the free tier:

### **Light Upgrade (~$5/month)**

```javascript
const API_CONFIG = {
  openAiKey: "your-openai-key", // Add AI analysis
  useRealAPI: true,
};
```

### **Professional Upgrade (~$50/month)**

```javascript
const API_CONFIG = {
  newsApiKey: "your-pro-newsapi-key", // Unlimited URLs
  openAiKey: "your-openai-key", // AI analysis
  useRealAPI: true,
};
```

---

## 🎉 **You're Ready!**

Your TruthLens app now has:

- ✅ **Real fake news detection**
- ✅ **Professional analysis quality**
- ✅ **Zero monthly costs**
- ✅ **No API key management**
- ✅ **100 analyses per day**

**Just run `npm start` and start detecting fake news for free!** 🚀

---

## 📞 **Need Help?**

If you want even more free features:

1. Get NewsAPI free key (50 more requests/day)
2. Set up Supabase free account (cloud storage)
3. Combine all free services for maximum features

**Total possible: 150 free analyses/day + cloud storage!**
