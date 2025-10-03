// Simple Express.js Backend Server for TruthLens
// This provides a backend option for users who want to run their own server

const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuration - Set your API keys here
const CONFIG = {
  NEWSAPI_KEY: process.env.NEWSAPI_KEY || "YOUR_NEWSAPI_KEY",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "YOUR_OPENAI_API_KEY",
  GEMINI_API_KEY:
    process.env.GEMINI_API_KEY || "AIzaSyBxwhKOd9NnB_CCQ-0zF14srNLxEkPLBhc",
  ENABLE_SCRAPING: process.env.ENABLE_SCRAPING === "true" || false,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Simple web scraper for article content
async function scrapeArticleContent(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // Try to extract article content using common selectors
    const contentSelectors = [
      "article p",
      ".article-content p",
      ".post-content p",
      ".entry-content p",
      ".content p",
      "main p",
      ".story-body p",
    ];

    let content = "";
    let title = $("title").text() || $("h1").first().text() || "";

    for (const selector of contentSelectors) {
      const paragraphs = $(selector);
      if (paragraphs.length > 0) {
        content = paragraphs
          .map((i, el) => $(el).text())
          .get()
          .join(" ");
        break;
      }
    }

    // Fallback to all paragraphs if specific selectors don't work
    if (!content) {
      content = $("p")
        .map((i, el) => $(el).text())
        .get()
        .join(" ");
    }

    return {
      title: title.trim(),
      content: content.trim().substring(0, 5000), // Limit content length
      url: url,
    };
  } catch (error) {
    throw new Error(`Failed to scrape article: ${error.message}`);
  }
}

// Gemini AI analysis function
async function analyzeWithGemini(text, title = "") {
  if (CONFIG.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
    throw new Error("Gemini API key not configured");
  }

  const prompt = `
You are an expert fact-checker and misinformation analyst. Analyze this news article for credibility, bias, and potential misinformation.

Title: ${title}
Content: ${text}

Provide your analysis in the following JSON format:
{
    "label": "Trusted|Biased|Fake",
    "confidence": 0.85,
    "reasoning": "Brief explanation of your assessment",
    "keywords": ["keyword1", "keyword2"],
    "red_flags": ["flag1", "flag2"]
}

Consider: source credibility, factual accuracy, emotional language, logical consistency, evidence quality.
Respond with ONLY the JSON object, no additional text.
  `.trim();

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const analysis = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Calculate probability distribution
      const baseConfidence = parseFloat(parsed.confidence);
      let probabilities;

      switch (parsed.label) {
        case "Fake":
          probabilities = {
            fake: baseConfidence,
            biased: (1 - baseConfidence) * 0.7,
            trusted: (1 - baseConfidence) * 0.3,
          };
          break;
        case "Biased":
          probabilities = {
            fake: (1 - baseConfidence) * 0.3,
            biased: baseConfidence,
            trusted: (1 - baseConfidence) * 0.7,
          };
          break;
        default: // Trusted
          probabilities = {
            fake: (1 - baseConfidence) * 0.2,
            biased: (1 - baseConfidence) * 0.3,
            trusted: baseConfidence,
          };
      }

      return {
        ...parsed,
        probabilities,
      };
    }

    throw new Error("Invalid response format from Gemini");
  } catch (error) {
    throw new Error(`Gemini analysis failed: ${error.message}`);
  }
}

// AI analysis function (supports OpenAI, Qwen, and Gemini)
async function analyzeWithOpenAI(text, title = "") {
  if (CONFIG.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY") {
    throw new Error("AI API key not configured");
  }

  // Detect API type and set appropriate endpoint and model
  let apiUrl, model;
  if (CONFIG.OPENAI_API_KEY.startsWith("sk-or-v1-")) {
    apiUrl = "https://api.openrouter.ai/api/v1/chat/completions";
    model = "qwen/qwen-2.5-72b-instruct";
  } else {
    apiUrl = "https://api.openai.com/v1/chat/completions";
    model = "gpt-3.5-turbo";
  }

  const prompt = `
Analyze this news article for credibility and potential misinformation:

Title: ${title}
Content: ${text}

Provide analysis in JSON format:
{
    "label": "Trusted|Biased|Fake",
    "confidence": 0.85,
    "reasoning": "Brief explanation",
    "keywords": ["keyword1", "keyword2"],
    "red_flags": ["flag1", "flag2"]
}

Consider: source credibility, factual accuracy, emotional language, logical consistency, evidence quality.
    `.trim();

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert fact-checker. Analyze news for credibility and misinformation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const analysis = response.data.choices[0].message.content;
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Calculate probability distribution
      const baseConfidence = parseFloat(parsed.confidence);
      let probabilities;

      switch (parsed.label) {
        case "Fake":
          probabilities = {
            fake: baseConfidence,
            biased: (1 - baseConfidence) * 0.7,
            trusted: (1 - baseConfidence) * 0.3,
          };
          break;
        case "Biased":
          probabilities = {
            fake: (1 - baseConfidence) * 0.3,
            biased: baseConfidence,
            trusted: (1 - baseConfidence) * 0.7,
          };
          break;
        default: // Trusted
          probabilities = {
            fake: (1 - baseConfidence) * 0.2,
            biased: (1 - baseConfidence) * 0.3,
            trusted: baseConfidence,
          };
      }

      return {
        ...parsed,
        probabilities,
      };
    }

    throw new Error("Invalid response format from OpenAI");
  } catch (error) {
    throw new Error(`OpenAI analysis failed: ${error.message}`);
  }
}

// Simple keyword-based analysis (fallback)
function simpleAnalysis(text) {
  const suspiciousKeywords = [
    "breaking news",
    "exclusive",
    "shocking",
    "unbelievable",
    "must read",
    "experts say",
    "studies show",
    "according to sources",
    "leaked documents",
    "conspiracy",
    "cover-up",
    "mainstream media",
    "fake news",
    "propaganda",
    "they don't want you to know",
    "secret",
    "hidden truth",
    "exposed",
  ];

  const credibleKeywords = [
    "research shows",
    "peer-reviewed",
    "according to",
    "data indicates",
    "study published",
    "experts confirm",
    "official statement",
    "verified",
  ];

  const suspiciousCount = suspiciousKeywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
  ).length;

  const credibleCount = credibleKeywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
  ).length;

  let label, confidence;

  if (suspiciousCount >= 3) {
    label = "Fake";
    confidence = 0.7 + Math.random() * 0.2;
  } else if (suspiciousCount > credibleCount) {
    label = "Biased";
    confidence = 0.6 + Math.random() * 0.2;
  } else {
    label = "Trusted";
    confidence = 0.7 + Math.random() * 0.2;
  }

  const probabilities = {
    fake: label === "Fake" ? confidence : (1 - confidence) * 0.3,
    biased: label === "Biased" ? confidence : (1 - confidence) * 0.4,
    trusted: label === "Trusted" ? confidence : (1 - confidence) * 0.3,
  };

  return {
    label,
    confidence,
    keywords: suspiciousKeywords
      .filter((k) => text.toLowerCase().includes(k.toLowerCase()))
      .slice(0, 5),
    reasoning: `Analysis based on ${suspiciousCount} suspicious and ${credibleCount} credible indicators`,
    probabilities,
  };
}

// =============================================================================
// API ROUTES
// =============================================================================

// Main analysis endpoint
app.post("/check-news", async (req, res) => {
  try {
    const { text, is_url } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text or URL is required" });
    }

    let articleText = text;
    let title = "";

    // If it's a URL, try to scrape content
    if (is_url && CONFIG.ENABLE_SCRAPING) {
      try {
        const scraped = await scrapeArticleContent(text);
        articleText = scraped.content;
        title = scraped.title;
      } catch (error) {
        console.error("Scraping failed:", error.message);
        return res.status(400).json({
          error: "Unable to fetch article content from URL",
          details: error.message,
        });
      }
    }

    let result;

    // Try Gemini analysis first (preferred)
    try {
      result = await analyzeWithGemini(articleText, title);
    } catch (error) {
      console.warn("Gemini analysis failed, trying OpenAI:", error.message);

      // Try OpenAI analysis as fallback
      try {
        result = await analyzeWithOpenAI(articleText, title);
      } catch (error2) {
        console.warn(
          "OpenAI analysis failed, using simple analysis:",
          error2.message
        );
        result = simpleAnalysis(articleText);
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "Analysis failed",
      details: error.message,
    });
  }
});

// Web scraping endpoint (for frontend to use)
app.post("/api/scrape", async (req, res) => {
  if (!CONFIG.ENABLE_SCRAPING) {
    return res.status(403).json({ error: "Web scraping is disabled" });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const result = await scrapeArticleContent(url);
    res.json(result);
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({
      error: "Scraping failed",
      details: error.message,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    config: {
      hasNewsAPI: CONFIG.NEWSAPI_KEY !== "YOUR_NEWSAPI_KEY",
      hasOpenAI: CONFIG.OPENAI_API_KEY !== "YOUR_OPENAI_API_KEY",
      hasGemini: CONFIG.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY",
      scrapingEnabled: CONFIG.ENABLE_SCRAPING,
    },
  });
});

// Serve the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

app.listen(PORT, () => {
  console.log(`🚀 TruthLens server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 API endpoint: http://localhost:${PORT}/check-news`);

  // Show configuration status
  console.log("\n📋 Configuration Status:");
  console.log(
    `   NewsAPI: ${
      CONFIG.NEWSAPI_KEY !== "YOUR_NEWSAPI_KEY"
        ? "✅ Configured"
        : "❌ Not configured"
    }`
  );
  console.log(
    `   OpenAI: ${
      CONFIG.OPENAI_API_KEY !== "YOUR_OPENAI_API_KEY"
        ? "✅ Configured"
        : "❌ Not configured"
    }`
  );
  console.log(
    `   Gemini AI: ${
      CONFIG.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY"
        ? "✅ Configured"
        : "❌ Not configured"
    }`
  );
  console.log(
    `   Web Scraping: ${CONFIG.ENABLE_SCRAPING ? "✅ Enabled" : "❌ Disabled"}`
  );

  if (
    CONFIG.NEWSAPI_KEY === "YOUR_NEWSAPI_KEY" &&
    CONFIG.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY" &&
    CONFIG.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY"
  ) {
    console.log(
      "\n⚠️  No API keys configured. Using simple keyword-based analysis."
    );
    console.log(
      "   Set NEWSAPI_KEY, OPENAI_API_KEY, or GEMINI_API_KEY environment variables for enhanced analysis."
    );
  } else if (CONFIG.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY") {
    console.log("\n🤖 Gemini AI analysis enabled!");
  }
});

module.exports = app;
