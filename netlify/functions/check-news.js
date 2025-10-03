const https = require("https");
const { URL } = require("url");

// Netlify serverless function for news analysis
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { text, url } = JSON.parse(event.body);

    if (!text && !url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Text or URL is required" }),
      };
    }

    let contentToAnalyze = text;

    // If URL is provided, fetch content (simplified for demo)
    if (url && !text) {
      try {
        contentToAnalyze = await fetchUrlContent(url);
      } catch (error) {
        console.error("URL fetch error:", error);
        contentToAnalyze = url; // Fallback to analyzing the URL itself
      }
    }

    // Try Gemini API first
    let result = null;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey && geminiApiKey !== "your_gemini_api_key_here") {
      try {
        result = await analyzeWithGemini(contentToAnalyze, geminiApiKey);
      } catch (error) {
        console.error("Gemini API error:", error);
      }
    } else {
      console.log("Gemini API key not configured, using fallback analysis");
    }

    // Fallback to simple analysis if Gemini fails
    if (!result) {
      result = performSimpleAnalysis(contentToAnalyze);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        label: "Error",
        confidence: 0,
        keywords: ["error"],
        probabilities: { fake: 0, biased: 0, trusted: 0 },
      }),
    };
  }
};

// Gemini API analysis
async function analyzeWithGemini(text, apiKey) {
  const prompt = `Analyze this news content for authenticity and bias. Respond with ONLY a valid JSON object in this exact format:
{
  "label": "Fake|Biased|Trusted",
  "confidence": 0.95,
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "probabilities": {"fake": 0.05, "biased": 0.00, "trusted": 0.95},
  "reasoning": "Brief explanation"
}

Content to analyze: "${text}"`;

  const requestData = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          if (response.candidates && response.candidates[0]) {
            const content = response.candidates[0].content.parts[0].text;
            const cleanContent = content
              .replace(/```json\n?|\n?```/g, "")
              .trim();
            const result = JSON.parse(cleanContent);

            // Validate and normalize the result
            if (result.label && result.confidence !== undefined) {
              resolve({
                label: result.label,
                confidence: Math.max(0, Math.min(1, result.confidence)),
                keywords: result.keywords || [],
                probabilities: result.probabilities || {
                  fake: 0,
                  biased: 0,
                  trusted: 0,
                },
                reasoning: result.reasoning || "AI analysis completed",
              });
            } else {
              throw new Error("Invalid response format");
            }
          } else {
            throw new Error("No candidates in response");
          }
        } catch (error) {
          reject(new Error(`Gemini analysis failed: ${error.message}`));
        }
      });
    });

    req.on("error", reject);
    req.write(requestData);
    req.end();
  });
}

// Simple fallback analysis
function performSimpleAnalysis(text) {
  const lowerText = text.toLowerCase();

  // Fake news indicators
  const fakeIndicators = [
    "shocking",
    "unbelievable",
    "doctors hate",
    "secret",
    "miracle cure",
    "they don't want you to know",
    "click here",
    "amazing discovery",
    "scientists discover",
    "breakthrough",
    "revolutionary",
    "banned",
    "suppressed",
    "hidden truth",
    "exposed",
    "revealed",
  ];

  // Bias indicators
  const biasIndicators = [
    "allegedly",
    "reportedly",
    "sources say",
    "rumored",
    "claims",
    "controversial",
    "disputed",
    "unconfirmed",
    "speculation",
  ];

  // Trusted indicators
  const trustedIndicators = [
    "according to",
    "study shows",
    "research indicates",
    "data reveals",
    "official statement",
    "confirmed by",
    "peer-reviewed",
    "published in",
  ];

  let fakeScore = 0;
  let biasScore = 0;
  let trustedScore = 0;

  // Count indicators
  fakeIndicators.forEach((indicator) => {
    if (lowerText.includes(indicator)) fakeScore += 1;
  });

  biasIndicators.forEach((indicator) => {
    if (lowerText.includes(indicator)) biasScore += 1;
  });

  trustedIndicators.forEach((indicator) => {
    if (lowerText.includes(indicator)) trustedScore += 1;
  });

  // Determine label and confidence
  let label, confidence;
  const totalScore = fakeScore + biasScore + trustedScore;

  if (fakeScore > biasScore && fakeScore > trustedScore) {
    label = "Fake";
    confidence = Math.min(
      0.95,
      0.6 + (fakeScore / Math.max(totalScore, 1)) * 0.35
    );
  } else if (trustedScore > fakeScore && trustedScore > biasScore) {
    label = "Trusted";
    confidence = Math.min(
      0.95,
      0.6 + (trustedScore / Math.max(totalScore, 1)) * 0.35
    );
  } else {
    label = "Biased";
    confidence = Math.min(
      0.95,
      0.5 + (biasScore / Math.max(totalScore, 1)) * 0.35
    );
  }

  // Generate keywords
  const keywords = [];
  if (fakeScore > 0) keywords.push("clickbait", "sensational");
  if (biasScore > 0) keywords.push("unverified", "claims");
  if (trustedScore > 0) keywords.push("factual", "verified");

  // Add some content-based keywords
  const words = text.split(/\s+/).slice(0, 10);
  words.forEach((word) => {
    if (word.length > 4 && !keywords.includes(word.toLowerCase())) {
      keywords.push(word.toLowerCase());
    }
  });

  return {
    label,
    confidence,
    keywords: keywords.slice(0, 8),
    probabilities: {
      fake: label === "Fake" ? confidence : (1 - confidence) / 2,
      biased: label === "Biased" ? confidence : (1 - confidence) / 2,
      trusted: label === "Trusted" ? confidence : (1 - confidence) / 2,
    },
    reasoning: `Simple analysis based on ${totalScore} indicators detected`,
  };
}

// Simplified URL content fetcher
async function fetchUrlContent(url) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: "GET",
        headers: {
          "User-Agent": "TruthLens/1.0",
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          // Simple text extraction (remove HTML tags)
          const textContent = data
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          resolve(textContent.substring(0, 2000)); // Limit content length
        });
      });

      req.on("error", reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}
