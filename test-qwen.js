// Quick test for Qwen API integration
// Run this with: node test-qwen.js

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_KEY =
  "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";

async function testQwenAPI() {
  console.log("🧪 Testing Qwen API integration...");

  const testArticle =
    "Breaking news: Scientists discover that drinking water is essential for human survival. This shocking revelation has stunned the medical community worldwide.";

  try {
    const response = await fetch(
      "https://api.openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen/qwen-2.5-72b-instruct",
          messages: [
            {
              role: "system",
              content:
                "You are an expert fact-checker. Analyze news for credibility and misinformation.",
            },
            {
              role: "user",
              content: `Analyze this news article for credibility:

Title: Breaking Discovery
Content: ${testArticle}

Provide analysis in JSON format:
{
    "label": "Trusted|Biased|Fake",
    "confidence": 0.85,
    "reasoning": "Brief explanation",
    "keywords": ["keyword1", "keyword2"]
}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log("✅ Qwen API Response:");
    console.log(analysis);

    // Try to parse JSON from response
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("\n🎯 Parsed Analysis:");
      console.log(`Label: ${parsed.label}`);
      console.log(`Confidence: ${Math.round(parsed.confidence * 100)}%`);
      console.log(`Reasoning: ${parsed.reasoning}`);
      console.log(`Keywords: ${parsed.keywords?.join(", ")}`);
    }

    console.log("\n🎉 Qwen API integration working perfectly!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.message.includes("401")) {
      console.log("💡 Check if your API key is valid and has credits");
    } else if (error.message.includes("429")) {
      console.log("💡 Rate limit reached, try again later");
    } else if (error.message.includes("network")) {
      console.log("💡 Check your internet connection");
    }
  }
}

// Run the test
testQwenAPI();
