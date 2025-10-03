// Quick test for Gemini API integration
// Run this with: node test-gemini.js

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const GEMINI_API_KEY = "AIzaSyBxwhKOd9NnB_CCQ-0zF14srNLxEkPLBhc";

async function testGeminiAPI() {
  console.log("🧪 Testing Gemini API integration...");

  const testArticle =
    "BREAKING: Secret government documents leaked! Shocking evidence reveals that mainstream media has been hiding the truth about a massive conspiracy involving world leaders. According to unnamed sources, this unbelievable cover-up has been exposed by independent researchers.";

  try {
    const prompt = `
You are an expert fact-checker and misinformation analyst. Analyze this news article for credibility, bias, and potential misinformation.

Title: Breaking News Test
Content: ${testArticle}

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
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
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.candidates[0].content.parts[0].text;

    console.log("✅ Gemini API Response:");
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
      console.log(`Red Flags: ${parsed.red_flags?.join(", ")}`);
    }

    console.log("\n🎉 Gemini API integration working perfectly!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.message.includes("403")) {
      console.log("💡 Check if your Gemini API key is valid and enabled");
    } else if (error.message.includes("429")) {
      console.log("💡 Rate limit reached, try again later");
    } else if (error.message.includes("400")) {
      console.log("💡 Check the request format and parameters");
    } else if (error.message.includes("network")) {
      console.log("💡 Check your internet connection");
    }
  }
}

// Run the test
testGeminiAPI();
