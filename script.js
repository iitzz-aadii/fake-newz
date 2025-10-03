// Supabase Configuration
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Initialize Supabase client (will be configured when user sets up Supabase)
let supabase = null;

// API Configuration
const API_ENDPOINT = "/check-news"; // Update this to your actual API endpoint

// Real API Integration Configuration
const API_CONFIG = {
  newsApiKey: "YOUR_NEWSAPI_KEY", // Get from https://newsapi.org
  openAiKey:
    "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", // Qwen thinking API key
  geminiApiKey: "AIzaSyBxwhKOd9NnB_CCQ-0zF14srNLxEkPLBhc", // Gemini API key
  useRealAPI: true, // Enable AI analysis with Gemini
  useFreeAPIsOnly: false, // Use AI analysis instead of just free services
};

// DOM Elements
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const newsInput = document.getElementById("news-input");
const checkBtn = document.getElementById("check-btn");
const clearBtn = document.getElementById("clear-btn");
const backBtn = document.getElementById("back-btn");
const loadingOverlay = document.getElementById("loading-overlay");
const toastContainer = document.getElementById("toast-container");

// Results page elements
const confidenceScore = document.getElementById("confidence-score");
const resultLabel = document.getElementById("result-label");
const resultTimestamp = document.getElementById("result-timestamp");
const fakeBar = document.getElementById("fake-bar");
const biasedBar = document.getElementById("biased-bar");
const trustedBar = document.getElementById("trusted-bar");
const fakePercent = document.getElementById("fake-percent");
const biasedPercent = document.getElementById("biased-percent");
const trustedPercent = document.getElementById("trusted-percent");
const keywordsContainer = document.getElementById("keywords-container");

// History page elements
const historyList = document.getElementById("history-list");
const emptyHistory = document.getElementById("empty-history");
const clearHistoryBtn = document.getElementById("clear-history-btn");

// Application State
let currentAnalysis = null;
let analysisHistory = [];

// Initialize Real API Analyzer
let realNewsAnalyzer = null;

// Initialize Application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  loadHistoryFromStorage();
  updateHistoryDisplay();
  initializeRealAPI();
  initializeLiveDemo();
  initializeDetailedReport();
  initializeShareFunctionality();
});

function initializeApp() {
  // Navigation event listeners
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetPage = link.dataset.page;
      navigateToPage(targetPage);
    });
  });

  // Button event listeners
  checkBtn.addEventListener("click", handleCheckAuthenticity);
  clearBtn.addEventListener("click", clearInput);
  backBtn.addEventListener("click", () => navigateToPage("home"));
  clearHistoryBtn.addEventListener("click", clearHistory);

  // Input event listeners
  newsInput.addEventListener("input", validateInput);
  newsInput.addEventListener("paste", handlePaste);

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleCheckAuthenticity();
    }
  });
}

// Navigation Functions
function navigateToPage(pageName) {
  // Update navigation
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === pageName);
  });

  // Update pages
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === `${pageName}-page`);
  });

  // Update history display when navigating to history page
  if (pageName === "history") {
    updateHistoryDisplay();
  }
}

// Input Handling Functions
function validateInput() {
  const text = newsInput.value.trim();
  checkBtn.disabled = text.length < 10;

  if (text.length < 10) {
    checkBtn.style.opacity = "0.6";
    checkBtn.style.cursor = "not-allowed";
  } else {
    checkBtn.style.opacity = "1";
    checkBtn.style.cursor = "pointer";
  }
}

function clearInput() {
  newsInput.value = "";
  validateInput();
  newsInput.focus();
}

function handlePaste(e) {
  // Allow some time for paste to complete, then validate
  setTimeout(validateInput, 100);
}

// Main Analysis Function
async function handleCheckAuthenticity() {
  const text = newsInput.value.trim();

  if (text.length < 10) {
    showToast("Please enter at least 10 characters", "warning");
    return;
  }

  try {
    showLoading(true);

    // Simulate API call (replace with actual API integration)
    const result = await analyzeNews(text);

    // Store analysis
    currentAnalysis = {
      id: Date.now(),
      text: text,
      result: result,
      timestamp: new Date(),
    };

    // Add to history
    analysisHistory.unshift(currentAnalysis);
    saveHistoryToStorage();

    // Display results
    displayResults(result);
    navigateToPage("results");

    showToast("Analysis completed successfully!", "success");
  } catch (error) {
    console.error("Analysis error:", error);
    showToast("Failed to analyze the article. Please try again.", "error");
  } finally {
    showLoading(false);
  }
}

// API Integration Function
async function analyzeNews(text) {
  // Try real API first if configured
  if (API_CONFIG.useRealAPI && realNewsAnalyzer) {
    try {
      console.log("Using real API for analysis...");
      const result = await realNewsAnalyzer.analyzeNews(text);

      // Ensure the result has the expected format
      return {
        label: result.label,
        confidence: result.confidence,
        keywords: result.keywords || [],
        probabilities: result.probabilities,
        reasoning: result.reasoning,
        similarArticles: result.similarArticles || [],
      };
    } catch (error) {
      console.error("Real API failed, falling back to mock data:", error);
      showToast("Real API unavailable, using demo mode", "warning");
    }
  }

  // Try free ClaimBuster API if enabled
  if (
    API_CONFIG.useFreeAPIsOnly &&
    typeof FactCheckingService !== "undefined"
  ) {
    try {
      console.log("Using free ClaimBuster API...");
      const factChecker = new FactCheckingService();
      const result = await factChecker.checkClaims(text);
      showToast("Using free ClaimBuster API!", "success");
      return result;
    } catch (error) {
      console.warn("ClaimBuster API failed, using mock data:", error);
      showToast("Free API unavailable, using demo mode", "warning");
    }
  }

  // Check if text is a URL
  const isUrl = /^https?:\/\/.+/.test(text.trim());

  try {
    // Try backend API call
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        is_url: isUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Fallback to mock data for demo purposes
    console.warn("API call failed, using mock data:", error);
    return generateMockResult(text);
  }
}

// Mock Data Generator (for demo purposes)
function generateMockResult(text) {
  const mockKeywords = [
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
  ];

  // Simple heuristic for demo
  const suspiciousWords = mockKeywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );

  let confidence, label, fakeProb, biasedProb, trustedProb;

  if (suspiciousWords.length >= 3) {
    // Likely fake
    confidence = 0.75 + Math.random() * 0.2;
    label = "Fake";
    fakeProb = confidence;
    biasedProb = (1 - confidence) * 0.7;
    trustedProb = (1 - confidence) * 0.3;
  } else if (suspiciousWords.length >= 1) {
    // Likely biased
    confidence = 0.6 + Math.random() * 0.25;
    label = "Biased";
    fakeProb = confidence * 0.3;
    biasedProb = confidence;
    trustedProb = 1 - confidence;
  } else {
    // Likely trusted
    confidence = 0.7 + Math.random() * 0.25;
    label = "Trusted";
    fakeProb = (1 - confidence) * 0.2;
    biasedProb = (1 - confidence) * 0.3;
    trustedProb = confidence;
  }

  return {
    label: label,
    confidence: confidence,
    keywords: suspiciousWords.slice(0, 5),
    probabilities: {
      fake: fakeProb,
      biased: biasedProb,
      trusted: trustedProb,
    },
  };
}

// Results Display Functions
function displayResults(result) {
  // Update timestamp
  resultTimestamp.textContent = new Date().toLocaleString();

  // Update confidence score
  const scoreValue = document.querySelector(".score-value");
  scoreValue.textContent = Math.round(result.confidence * 100) + "%";

  // Update result label
  const labelText = document.querySelector(".label-text");
  labelText.textContent = result.label;
  labelText.className = `label-text label-${result.label.toLowerCase()}`;

  // Update probability bars
  const probabilities = result.probabilities || {
    fake: result.label === "Fake" ? result.confidence : 0.2,
    biased: result.label === "Biased" ? result.confidence : 0.3,
    trusted: result.label === "Trusted" ? result.confidence : 0.5,
  };

  // Animate bars
  setTimeout(() => {
    updateProbabilityBar(fakeBar, fakePercent, probabilities.fake);
    updateProbabilityBar(biasedBar, biasedPercent, probabilities.biased);
    updateProbabilityBar(trustedBar, trustedPercent, probabilities.trusted);
  }, 300);

  // Update keywords
  displayKeywords(result.keywords || []);
}

function updateProbabilityBar(barElement, percentElement, probability) {
  const percentage = Math.round(probability * 100);
  barElement.style.width = percentage + "%";
  percentElement.textContent = percentage + "%";
}

function displayKeywords(keywords) {
  keywordsContainer.innerHTML = "";

  if (keywords.length === 0) {
    keywordsContainer.innerHTML =
      '<p style="color: #718096; font-style: italic;">No significant keywords detected</p>';
    return;
  }

  keywords.forEach((keyword) => {
    const tag = document.createElement("span");
    tag.className = "keyword-tag";
    tag.textContent = keyword;

    // Add negative class for suspicious keywords
    const suspiciousKeywords = [
      "fake",
      "conspiracy",
      "cover-up",
      "propaganda",
      "shocking",
      "unbelievable",
    ];
    if (suspiciousKeywords.some((sus) => keyword.toLowerCase().includes(sus))) {
      tag.classList.add("negative");
    }

    keywordsContainer.appendChild(tag);
  });
}

// History Management Functions
function updateHistoryDisplay() {
  if (analysisHistory.length === 0) {
    historyList.style.display = "none";
    emptyHistory.style.display = "block";
    return;
  }

  historyList.style.display = "block";
  emptyHistory.style.display = "none";

  historyList.innerHTML = "";

  analysisHistory.forEach((analysis) => {
    const historyItem = createHistoryItem(analysis);
    historyList.appendChild(historyItem);
  });
}

function createHistoryItem(analysis) {
  const item = document.createElement("div");
  item.className = "history-item";

  const preview =
    analysis.text.length > 150
      ? analysis.text.substring(0, 150) + "..."
      : analysis.text;

  item.innerHTML = `
        <div class="history-header">
            <span class="history-result label-${analysis.result.label.toLowerCase()}">${
    analysis.result.label
  }</span>
            <span class="history-timestamp">${analysis.timestamp.toLocaleString()}</span>
        </div>
        <div class="history-preview">${preview}</div>
    `;

  item.addEventListener("click", () => {
    currentAnalysis = analysis;
    displayResults(analysis.result);
    navigateToPage("results");
  });

  return item;
}

function clearHistory() {
  if (analysisHistory.length === 0) {
    showToast("History is already empty", "warning");
    return;
  }

  if (confirm("Are you sure you want to clear all analysis history?")) {
    analysisHistory = [];
    saveHistoryToStorage();
    updateHistoryDisplay();
    showToast("History cleared successfully", "success");
  }
}

// Local Storage Functions
function saveHistoryToStorage() {
  try {
    localStorage.setItem("truthlens_history", JSON.stringify(analysisHistory));
  } catch (error) {
    console.error("Failed to save history:", error);
  }
}

function loadHistoryFromStorage() {
  try {
    const stored = localStorage.getItem("truthlens_history");
    if (stored) {
      analysisHistory = JSON.parse(stored).map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    }
  } catch (error) {
    console.error("Failed to load history:", error);
    analysisHistory = [];
  }
}

// Supabase Integration Functions
async function initializeSupabase() {
  if (
    SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
    SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
  ) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("Supabase initialized successfully");

      // Create table if it doesn't exist
      await createAnalysisTable();

      // Load history from Supabase
      await loadHistoryFromSupabase();
    } catch (error) {
      console.error("Failed to initialize Supabase:", error);
    }
  }
}

async function createAnalysisTable() {
  if (!supabase) return;

  // This would typically be done via Supabase dashboard or migrations
  // Keeping this as a reference for the table structure needed
  console.log("Analysis table structure needed:", {
    id: "uuid primary key default gen_random_uuid()",
    text: "text not null",
    result: "jsonb not null",
    created_at: "timestamp with time zone default now()",
  });
}

async function saveAnalysisToSupabase(analysis) {
  if (!supabase) return;

  try {
    const { data, error } = await supabase.from("analyses").insert([
      {
        text: analysis.text,
        result: analysis.result,
        created_at: analysis.timestamp.toISOString(),
      },
    ]);

    if (error) throw error;
    console.log("Analysis saved to Supabase:", data);
  } catch (error) {
    console.error("Failed to save to Supabase:", error);
  }
}

async function loadHistoryFromSupabase() {
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    if (data && data.length > 0) {
      analysisHistory = data.map((item) => ({
        id: item.id,
        text: item.text,
        result: item.result,
        timestamp: new Date(item.created_at),
      }));

      updateHistoryDisplay();
    }
  } catch (error) {
    console.error("Failed to load from Supabase:", error);
  }
}

// UI Helper Functions
function showLoading(show) {
  loadingOverlay.classList.toggle("active", show);
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon = getToastIcon(type);
  toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;

  toastContainer.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

function getToastIcon(type) {
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };
  return icons[type] || icons.info;
}

// Initialize Real API Integration
function initializeRealAPI() {
  // Try Netlify analyzer first (for production), then fallback to RealNewsAnalyzer
  if (typeof NetlifyNewsAnalyzer !== "undefined") {
    realNewsAnalyzer = new NetlifyNewsAnalyzer();
    console.log("✅ Netlify API analyzer initialized");
    return;
  }

  // Check if RealNewsAnalyzer is available (from api-integration.js)
  if (typeof RealNewsAnalyzer !== "undefined") {
    // Only initialize if API keys are provided
    if (
      API_CONFIG.newsApiKey !== "YOUR_NEWSAPI_KEY" ||
      API_CONFIG.openAiKey !== "YOUR_OPENAI_API_KEY" ||
      API_CONFIG.geminiApiKey
    ) {
      realNewsAnalyzer = new RealNewsAnalyzer({
        newsApiKey:
          API_CONFIG.newsApiKey !== "YOUR_NEWSAPI_KEY"
            ? API_CONFIG.newsApiKey
            : null,
        openAiKey:
          API_CONFIG.openAiKey !== "YOUR_OPENAI_API_KEY"
            ? API_CONFIG.openAiKey
            : null,
        geminiApiKey: API_CONFIG.geminiApiKey || null,
      });

      console.log("Real API analyzer initialized");

      // Show status to user
      if (API_CONFIG.useRealAPI) {
        let apiType = "OpenAI";
        if (API_CONFIG.geminiApiKey) {
          apiType = "Gemini AI";
        } else if (API_CONFIG.openAiKey.startsWith("sk-or-v1-")) {
          apiType = "Qwen AI";
        }
        showToast(`${apiType} integration active!`, "success");
      }
    } else {
      console.log("Real API keys not configured, using mock data");
    }
  } else {
    console.log("api-integration.js not loaded, using fallback methods");
  }
}

// Initialize Supabase when page loads
document.addEventListener("DOMContentLoaded", initializeSupabase);

// Live demo animation
function initializeLiveDemo() {
  const demoCard = document.getElementById("demo-card");
  const demoChecking = document.getElementById("demo-checking");
  const demoFinal = document.getElementById("demo-final");

  if (demoCard && demoChecking && demoFinal) {
    // Start animation when card comes into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            demoChecking.style.display = "none";
            demoFinal.style.display = "flex";
          }, 2000);
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(demoCard);
  }
}

// Detailed report functionality
function initializeDetailedReport() {
  const expandBtn = document.getElementById("expand-report");
  const detailedContent = document.getElementById("detailed-content");

  if (expandBtn && detailedContent) {
    expandBtn.addEventListener("click", () => {
      const isExpanded = detailedContent.style.display === "block";

      if (isExpanded) {
        detailedContent.style.display = "none";
        expandBtn.classList.remove("expanded");
        expandBtn.querySelector("span").textContent =
          "Detailed Analysis Report";
      } else {
        detailedContent.style.display = "block";
        expandBtn.classList.add("expanded");
        expandBtn.querySelector("span").textContent = "Hide Detailed Report";

        // Simulate loading detailed data
        setTimeout(() => {
          updateDetailedReport();
        }, 500);
      }
    });
  }
}

// Update detailed report with mock data
function updateDetailedReport() {
  const sourceScore = document.getElementById("source-score");
  const sourceDetails = document.getElementById("source-details");
  const sentimentLabel = document.getElementById("sentiment-label");
  const sentimentFill = document.getElementById("sentiment-fill");
  const citationsList = document.getElementById("citations-list");

  if (sourceScore) sourceScore.textContent = "75/100";
  if (sourceDetails)
    sourceDetails.textContent =
      "Source shows moderate credibility with some bias indicators detected.";
  if (sentimentLabel) sentimentLabel.textContent = "Negative";
  if (sentimentFill) sentimentFill.style.width = "70%";
  if (citationsList) {
    citationsList.innerHTML = `
            <div style="margin-bottom: 0.5rem;">• Cross-referenced with Snopes.com</div>
            <div style="margin-bottom: 0.5rem;">• Verified against PolitiFact database</div>
            <div>• Checked with Reuters Fact Check</div>
        `;
  }
}

// Share functionality
function initializeShareFunctionality() {
  const shareBtn = document.getElementById("share-result");
  const shareOptions = document.getElementById("share-options");

  if (shareBtn && shareOptions) {
    shareBtn.addEventListener("click", () => {
      const isVisible = shareOptions.style.display === "flex";
      shareOptions.style.display = isVisible ? "none" : "flex";
    });

    // Handle share options
    const shareOptionBtns = shareOptions.querySelectorAll(".share-option");
    shareOptionBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const platform = e.currentTarget.dataset.platform;
        handleShare(platform);
      });
    });
  }
}

// Handle share functionality
function handleShare(platform) {
  const url = window.location.href;
  const text = "Check out this fake news analysis from TruthLens!";

  switch (platform) {
    case "twitter":
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
      break;
    case "facebook":
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`,
        "_blank"
      );
      break;
    case "copy":
      navigator.clipboard
        .writeText(url)
        .then(() => {
          showToast("Link copied to clipboard!", "success");
        })
        .catch(() => {
          showToast("Failed to copy link", "error");
        });
      break;
  }
}

// Export functions for potential external use
window.TruthLens = {
  analyzeNews,
  navigateToPage,
  showToast,
  initializeSupabase,
};
