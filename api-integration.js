// Enhanced API Integration for TruthLens
// This file provides real internet data access options

// =============================================================================
// OPTION 1: NewsAPI + OpenAI Integration (Recommended)
// =============================================================================

// Configuration - Replace with your actual API keys
const NEWSAPI_KEY = "YOUR_NEWSAPI_KEY"; // Get from https://newsapi.org
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; // Get from https://openai.com

// NewsAPI Integration for URL content fetching
class NewsAPIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://newsapi.org/v2";
  }

  // Fetch article content from URL
  async fetchArticleContent(url) {
    try {
      // NewsAPI doesn't directly fetch content, but we can search for it
      const domain = new URL(url).hostname;
      const response = await fetch(
        `${this.baseUrl}/everything?domains=${domain}&apiKey=${this.apiKey}&pageSize=1`
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status}`);
      }

      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        const article = data.articles[0];
        return {
          title: article.title,
          content: article.content || article.description,
          source: article.source.name,
          publishedAt: article.publishedAt,
          url: article.url,
        };
      }

      throw new Error("Article not found in NewsAPI");
    } catch (error) {
      console.error("NewsAPI fetch error:", error);
      throw error;
    }
  }

  // Search for similar articles to cross-reference
  async searchSimilarArticles(query, pageSize = 5) {
    try {
      const response = await fetch(
        `${this.baseUrl}/everything?q=${encodeURIComponent(
          query
        )}&sortBy=relevancy&pageSize=${pageSize}&apiKey=${this.apiKey}`
      );

      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error("NewsAPI search error:", error);
      return [];
    }
  }
}

// Gemini AI Analysis Service
class GeminiAnalysisService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl =
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
  }

  // Analyze text for fake news indicators
  async analyzeText(text, title = "") {
    try {
      const prompt = this.createAnalysisPrompt(text, title);

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.candidates[0].content.parts[0].text;

      return this.parseAnalysisResponse(analysis);
    } catch (error) {
      console.error("Gemini analysis error:", error);
      throw error;
    }
  }

  createAnalysisPrompt(text, title) {
    return `
You are an expert fact-checker and misinformation analyst. Analyze this news article for credibility, bias, and potential misinformation.

Title: ${title}
Content: ${text}

Provide your analysis in the following JSON format:
{
    "label": "Trusted|Biased|Fake",
    "confidence": 0.85,
    "reasoning": "Brief explanation of your assessment",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "red_flags": ["flag1", "flag2"],
    "credibility_indicators": ["indicator1", "indicator2"]
}

Consider these factors:
1. Source credibility and bias
2. Factual accuracy and verifiability
3. Emotional language and sensationalism
4. Logical consistency
5. Supporting evidence quality
6. Potential misinformation patterns

Respond with ONLY the JSON object, no additional text.
    `.trim();
  }

  parseAnalysisResponse(response) {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Ensure confidence is a number between 0 and 1
        if (typeof parsed.confidence === "string") {
          parsed.confidence = parseFloat(parsed.confidence);
        }

        // Calculate probability distribution
        const baseConfidence = parsed.confidence;
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

      throw new Error("Invalid JSON response from Gemini");
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      // Fallback response
      return {
        label: "Biased",
        confidence: 0.5,
        reasoning: "Unable to complete analysis",
        keywords: ["analysis-error"],
        red_flags: [],
        credibility_indicators: [],
        probabilities: {
          fake: 0.3,
          biased: 0.5,
          trusted: 0.2,
        },
      };
    }
  }
}

// AI Analysis Service (supports OpenAI, Qwen, and Gemini)
class OpenAIAnalysisService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // Detect if it's a Qwen API key and use appropriate endpoint
    if (apiKey.startsWith("sk-or-v1-")) {
      this.baseUrl = "https://api.openrouter.ai/api/v1";
      this.model = "qwen/qwen-2.5-72b-instruct";
    } else {
      this.baseUrl = "https://api.openai.com/v1";
      this.model = "gpt-3.5-turbo";
    }
  }

  // Analyze text for fake news indicators
  async analyzeText(text, title = "") {
    try {
      const prompt = this.createAnalysisPrompt(text, title);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert fact-checker and misinformation analyst. Analyze news articles for credibility, bias, and potential misinformation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;

      return this.parseAnalysisResponse(analysis);
    } catch (error) {
      console.error("OpenAI analysis error:", error);
      throw error;
    }
  }

  createAnalysisPrompt(text, title) {
    return `
Please analyze the following news article for credibility and potential misinformation:

Title: ${title}
Content: ${text}

Provide your analysis in the following JSON format:
{
    "label": "Trusted|Biased|Fake",
    "confidence": 0.85,
    "reasoning": "Brief explanation of your assessment",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "red_flags": ["flag1", "flag2"],
    "credibility_indicators": ["indicator1", "indicator2"]
}

Consider these factors:
1. Source credibility and bias
2. Factual accuracy and verifiability
3. Emotional language and sensationalism
4. Logical consistency
5. Supporting evidence quality
6. Potential misinformation patterns
        `.trim();
  }

  parseAnalysisResponse(response) {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Ensure confidence is a number between 0 and 1
        if (typeof parsed.confidence === "string") {
          parsed.confidence = parseFloat(parsed.confidence);
        }

        // Calculate probability distribution
        const baseConfidence = parsed.confidence;
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

      throw new Error("Invalid JSON response from OpenAI");
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      // Fallback response
      return {
        label: "Biased",
        confidence: 0.5,
        reasoning: "Unable to complete analysis",
        keywords: ["analysis-error"],
        red_flags: [],
        credibility_indicators: [],
        probabilities: {
          fake: 0.3,
          biased: 0.5,
          trusted: 0.2,
        },
      };
    }
  }
}

// =============================================================================
// OPTION 2: Alternative Free APIs
// =============================================================================

// Web scraping service (for educational purposes)
class WebScrapingService {
  // Note: This requires a backend to avoid CORS issues
  async fetchArticleContent(url) {
    try {
      // This would need to be implemented on your backend
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Scraping service error");
      }

      return await response.json();
    } catch (error) {
      console.error("Web scraping error:", error);
      throw error;
    }
  }
}

// Fact-checking API integration (example with ClaimBuster)
class FactCheckingService {
  constructor() {
    this.baseUrl = "https://idir.uta.edu/claimbuster/api/v2";
  }

  async checkClaims(text) {
    try {
      const response = await fetch(
        `${this.baseUrl}/score/text/${encodeURIComponent(text)}`
      );

      if (!response.ok) {
        throw new Error("Fact-checking API error");
      }

      const data = await response.json();
      return this.processFactCheckResults(data);
    } catch (error) {
      console.error("Fact-checking error:", error);
      throw error;
    }
  }

  processFactCheckResults(data) {
    // Process ClaimBuster response format
    const claims = data.results || [];
    const avgScore =
      claims.reduce((sum, claim) => sum + claim.score, 0) / claims.length;

    let label, confidence;
    if (avgScore > 0.7) {
      label = "Fake";
      confidence = avgScore;
    } else if (avgScore > 0.4) {
      label = "Biased";
      confidence = avgScore;
    } else {
      label = "Trusted";
      confidence = 1 - avgScore;
    }

    return {
      label,
      confidence,
      keywords: claims.map((claim) => claim.text.substring(0, 50)),
      probabilities: {
        fake: avgScore,
        biased: Math.abs(0.5 - avgScore),
        trusted: 1 - avgScore,
      },
    };
  }
}

// =============================================================================
// MAIN INTEGRATION CLASS
// =============================================================================

class RealNewsAnalyzer {
  constructor(config = {}) {
    this.newsAPI = config.newsApiKey
      ? new NewsAPIService(config.newsApiKey)
      : null;
    this.openAI = config.openAiKey
      ? new OpenAIAnalysisService(config.openAiKey)
      : null;
    this.gemini = config.geminiApiKey
      ? new GeminiAnalysisService(config.geminiApiKey)
      : null;
    this.factChecker = new FactCheckingService();
    this.webScraper = new WebScrapingService();
  }

  async analyzeNews(input) {
    const isUrl = /^https?:\/\/.+/.test(input.trim());

    try {
      let text,
        title = "";

      if (isUrl) {
        // Try to fetch content from URL
        const article = await this.fetchArticleFromUrl(input);
        text = article.content;
        title = article.title;
      } else {
        text = input;
      }

      // Perform analysis using available services
      let result;

      if (this.gemini) {
        // Use Gemini for comprehensive analysis (preferred)
        result = await this.gemini.analyzeText(text, title);
      } else if (this.openAI) {
        // Use OpenAI for comprehensive analysis
        result = await this.openAI.analyzeText(text, title);
      } else {
        // Fallback to fact-checking service
        result = await this.factChecker.checkClaims(text);
      }

      // Enhance with cross-referencing if NewsAPI is available
      if (this.newsAPI && title) {
        const similarArticles = await this.newsAPI.searchSimilarArticles(title);
        result.similarArticles = similarArticles.slice(0, 3);
      }

      return result;
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  }

  async fetchArticleFromUrl(url) {
    // Try multiple methods to fetch article content
    const methods = [];

    if (this.newsAPI) methods.push(() => this.newsAPI.fetchArticleContent(url));
    methods.push(() => this.webScraper.fetchArticleContent(url));

    for (const method of methods) {
      try {
        return await method();
      } catch (error) {
        console.warn("Fetch method failed:", error.message);
        continue;
      }
    }

    throw new Error("Unable to fetch article content from any source");
  }
}

// Export for use in main application
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    RealNewsAnalyzer,
    NewsAPIService,
    OpenAIAnalysisService,
    GeminiAnalysisService,
    FactCheckingService,
    WebScrapingService,
  };
} else {
  // Browser environment
  window.RealNewsAnalyzer = RealNewsAnalyzer;
  window.NewsAPIService = NewsAPIService;
  window.OpenAIAnalysisService = OpenAIAnalysisService;
  window.GeminiAnalysisService = GeminiAnalysisService;
  window.FactCheckingService = FactCheckingService;
}
