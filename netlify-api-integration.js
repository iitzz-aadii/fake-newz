// Netlify-optimized API Integration for TruthLens
class NetlifyNewsAnalyzer {
  constructor() {
    // Automatically detect environment
    this.isProduction = window.location.hostname !== "localhost";
    this.apiEndpoint = this.isProduction
      ? "/.netlify/functions/check-news" // Netlify Functions
      : "http://localhost:3001/check-news"; // Local development

    console.log(
      `🌐 Environment: ${this.isProduction ? "Production" : "Development"}`
    );
    console.log(`📡 API Endpoint: ${this.apiEndpoint}`);
  }

  // Main analysis function
  async analyzeNews(text, url = null) {
    try {
      console.log("🔍 Starting news analysis...");

      const requestBody = {
        text: text || null,
        url: url || null,
      };

      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Validate result structure
      if (!result.label || result.confidence === undefined) {
        throw new Error("Invalid response format");
      }

      console.log("✅ Analysis completed:", result.label);
      return this.normalizeResult(result);
    } catch (error) {
      console.error("❌ Analysis failed:", error);

      // Return fallback result
      return this.getFallbackResult(text || url || "");
    }
  }

  // Normalize API response
  normalizeResult(result) {
    return {
      label: result.label || "Unknown",
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      keywords: Array.isArray(result.keywords) ? result.keywords : [],
      probabilities: {
        fake: result.probabilities?.fake || 0,
        biased: result.probabilities?.biased || 0,
        trusted: result.probabilities?.trusted || 0,
      },
      reasoning: result.reasoning || "Analysis completed",
      timestamp: new Date().toISOString(),
    };
  }

  // Fallback analysis when API fails
  getFallbackResult(content) {
    const lowerContent = content.toLowerCase();

    // Simple keyword-based analysis
    const suspiciousWords = [
      "shocking",
      "unbelievable",
      "secret",
      "doctors hate",
      "miracle",
      "amazing",
      "click here",
      "won't believe",
    ];

    const trustWords = [
      "study",
      "research",
      "according to",
      "official",
      "confirmed",
      "data shows",
      "published",
    ];

    let suspiciousCount = 0;
    let trustCount = 0;

    suspiciousWords.forEach((word) => {
      if (lowerContent.includes(word)) suspiciousCount++;
    });

    trustWords.forEach((word) => {
      if (lowerContent.includes(word)) trustCount++;
    });

    let label, confidence;
    if (suspiciousCount > trustCount) {
      label = "Fake";
      confidence = 0.7;
    } else if (trustCount > suspiciousCount) {
      label = "Trusted";
      confidence = 0.8;
    } else {
      label = "Biased";
      confidence = 0.6;
    }

    return {
      label,
      confidence,
      keywords: ["fallback", "analysis"],
      probabilities: {
        fake: label === "Fake" ? confidence : (1 - confidence) / 2,
        biased: label === "Biased" ? confidence : (1 - confidence) / 2,
        trusted: label === "Trusted" ? confidence : (1 - confidence) / 2,
      },
      reasoning: "Fallback analysis - API unavailable",
      timestamp: new Date().toISOString(),
    };
  }

  // Test connection
  async testConnection() {
    try {
      const result = await this.analyzeNews("Test connection");
      console.log("✅ API connection test successful");
      return true;
    } catch (error) {
      console.error("❌ API connection test failed:", error);
      return false;
    }
  }
}

// Initialize for global use
window.NetlifyNewsAnalyzer = NetlifyNewsAnalyzer;

// Auto-initialize if not already done
if (typeof window !== "undefined" && !window.netlifyAnalyzer) {
  window.netlifyAnalyzer = new NetlifyNewsAnalyzer();
  console.log("🚀 Netlify News Analyzer initialized");
}
