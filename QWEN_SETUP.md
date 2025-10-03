# 🤖 TruthLens + Qwen AI Setup Guide

Your TruthLens app is now powered by **Qwen 2.5-72B**, one of the most advanced AI models for text analysis!

## ✅ **Setup Complete!**

Your Qwen API key has been integrated:

- **API Key**: `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`
- **Model**: Qwen 2.5-72B Instruct (via OpenRouter)
- **Status**: Ready to use!

## 🚀 **How to Test**

### **Option 1: Test the API directly**

```bash
node test-qwen.js
```

### **Option 2: Run your app**

```bash
npm start
```

Then:

1. Open `http://localhost:3000`
2. Paste any news article
3. Click "Check Authenticity"
4. You'll see: "Qwen AI integration active!" ✅

## 🎯 **What You Get with Qwen AI**

### **Advanced Analysis Features:**

- **🧠 Superior reasoning**: 72B parameter model
- **🔍 Deep context understanding**: Better than GPT-3.5
- **📊 Nuanced scoring**: More accurate confidence levels
- **🎯 Detailed explanations**: Clear reasoning for decisions
- **🔗 Multi-language support**: Analyze news in various languages

### **Cost-Effective:**

- **~$0.01-0.03 per analysis** (cheaper than GPT-4)
- **High quality results** at competitive pricing
- **No daily limits** (pay-per-use)

## 📊 **Qwen vs Other Options**

| Feature       | Qwen 2.5-72B    | GPT-3.5         | ClaimBuster (Free) |
| ------------- | --------------- | --------------- | ------------------ |
| **Quality**   | Excellent       | Good            | Basic              |
| **Cost**      | ~$0.02/analysis | ~$0.01/analysis | Free (100/day)     |
| **Reasoning** | Advanced        | Standard        | Rule-based         |
| **Languages** | Multi-language  | English-focused | English only       |
| **Context**   | 32k tokens      | 4k tokens       | Limited            |

## 🔧 **Advanced Configuration**

### **Customize the Analysis Prompt**

Edit `api-integration.js` to modify how Qwen analyzes articles:

```javascript
createAnalysisPrompt(text, title) {
  return `
You are an expert fact-checker with access to global news databases.

Analyze this article with special attention to:
1. Source credibility and verification
2. Cross-referencing with known facts
3. Logical consistency and evidence quality
4. Potential bias indicators
5. Misinformation patterns

Article: ${title}
Content: ${text}

Provide detailed JSON analysis...
  `;
}
```

### **Adjust Model Parameters**

Fine-tune the analysis in `api-integration.js`:

```javascript
body: JSON.stringify({
  model: "qwen/qwen-2.5-72b-instruct",
  messages: [...],
  max_tokens: 800,        // More detailed responses
  temperature: 0.1,       // More focused analysis
  top_p: 0.9             // Better coherence
})
```

## 🌟 **Why Qwen 2.5-72B is Excellent for Fact-Checking**

### **1. Advanced Reasoning**

- Better logical analysis than smaller models
- Can detect subtle misinformation patterns
- Understands context and implications

### **2. Multilingual Capabilities**

- Analyze news in Chinese, Spanish, French, etc.
- Cross-cultural misinformation detection
- Global news source understanding

### **3. Large Context Window**

- Can analyze very long articles (32k tokens)
- Maintains context across entire documents
- Better understanding of complex narratives

### **4. Recent Training Data**

- Up-to-date knowledge of current events
- Awareness of recent misinformation trends
- Better detection of emerging fake news patterns

## 🎛️ **Backend Server Option**

If you want to use the backend server with Qwen:

```bash
# Set environment variable
export OPENAI_API_KEY="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"

# Start server
npm run server
```

The server will automatically detect it's a Qwen key and use the appropriate endpoint.

## 📈 **Usage Tips**

### **For Best Results:**

1. **Provide context**: Include article titles when possible
2. **Use full articles**: Qwen works better with complete content
3. **Multiple languages**: Test with non-English content
4. **Long articles**: Take advantage of the large context window

### **Cost Management:**

- **Monitor usage**: Check OpenRouter dashboard
- **Cache results**: Store analysis to avoid re-analyzing
- **Batch processing**: Analyze multiple articles efficiently

## 🔍 **Testing Your Setup**

Run the test script to verify everything works:

```bash
node test-qwen.js
```

Expected output:

```
🧪 Testing Qwen API integration...
✅ Qwen API Response:
{
    "label": "Trusted",
    "confidence": 0.95,
    "reasoning": "This is factual information about water...",
    "keywords": ["water", "survival", "medical"]
}
🎉 Qwen API integration working perfectly!
```

## 🎉 **You're All Set!**

Your TruthLens app now features:

- ✅ **State-of-the-art AI analysis** with Qwen 2.5-72B
- ✅ **Advanced reasoning capabilities**
- ✅ **Multi-language support**
- ✅ **Cost-effective pricing**
- ✅ **Professional-grade results**

**Start analyzing news with AI-powered precision!** 🚀

---

## 📞 **Need Help?**

- **API Issues**: Check OpenRouter dashboard for credits/usage
- **Model Performance**: Try adjusting temperature and max_tokens
- **Cost Concerns**: Monitor usage and set up billing alerts
- **Integration Problems**: Run `node test-qwen.js` for diagnostics
