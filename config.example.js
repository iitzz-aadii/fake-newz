// TruthLens Configuration Example
// Copy this file to config.js and update with your actual API keys

const CONFIG = {
  // NewsAPI Configuration
  // Get your key from: https://newsapi.org (50 requests/day free)
  newsApiKey: "your-newsapi-key-here",

  // OpenAI Configuration
  // Get your key from: https://openai.com (~$0.01-0.05 per analysis)
  openAiKey: "your-openai-api-key-here",

  // Enable real API integration (set to true when you have keys)
  useRealAPI: false,

  // Supabase Configuration (optional)
  // Get from your Supabase project dashboard
  supabaseUrl: "your-supabase-project-url",
  supabaseAnonKey: "your-supabase-anon-key",

  // Backend Server Settings
  serverPort: 3001,
  enableScraping: true,

  // Development Settings
  debugMode: false,
};

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
} else {
  window.APP_CONFIG = CONFIG;
}
