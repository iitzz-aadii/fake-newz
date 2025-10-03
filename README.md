# TruthLens - AI-Powered Fake News Detection

A sophisticated web application that uses Google Gemini AI to analyze news articles and detect misinformation with high accuracy.

## 🌟 Features

- **AI-Powered Analysis**: Google Gemini integration for accurate fake news detection
- **Real-time Results**: Instant credibility assessment with confidence scores
- **Comprehensive Reporting**: Detailed analysis with source credibility and citations
- **Modern UI/UX**: Professional, responsive design with trust indicators
- **History Management**: Track and review previous analyses
- **Social Sharing**: Share results across platforms
- **Responsive Design**: Perfect experience on all devices

## 🚀 Live Demo

Visit: [https://truthlens.netlify.app](https://truthlens.netlify.app)

## 📦 Deployment on Netlify

### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/truthlens)

### Manual Deployment

1. **Fork this repository** to your GitHub account

2. **Connect to Netlify**:

   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose your forked repository

3. **Configure Build Settings**:

   - Build command: `echo 'Static site - no build required'`
   - Publish directory: `.` (root directory)
   - Functions directory: `netlify/functions`

4. **Set Environment Variables**:
   Go to Site Settings > Environment Variables and add:

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Deploy**: Click "Deploy site"

### Getting API Keys

#### Google Gemini AI (Required)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to Netlify environment variables as `GEMINI_API_KEY`

#### Optional APIs

- **OpenAI**: [Platform OpenAI](https://platform.openai.com/api-keys)
- **NewsAPI**: [NewsAPI.org](https://newsapi.org/register)

## 🛠️ Local Development

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/truthlens.git
   cd truthlens
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Start development server**:

   ```bash
   npm start
   ```

5. **Open in browser**: http://localhost:3001

## 📁 Project Structure

```
truthlens/
├── index.html              # Main HTML file
├── styles.css              # Comprehensive styling
├── script.js               # Main application logic
├── api-integration.js      # API integration utilities
├── netlify-api-integration.js  # Netlify-optimized API
├── server.js               # Local development server
├── netlify/
│   └── functions/
│       └── check-news.js   # Serverless function for analysis
├── netlify.toml            # Netlify configuration
├── package.json            # Project dependencies
└── README.md               # This file
```

## 🔧 Configuration

### Netlify Functions

The app automatically detects the environment:

- **Production**: Uses Netlify Functions (`/.netlify/functions/check-news`)
- **Development**: Uses local server (`http://localhost:3001/check-news`)

### Environment Variables

Set these in Netlify's dashboard under Site Settings > Environment Variables:

| Variable         | Required | Description                    |
| ---------------- | -------- | ------------------------------ |
| `GEMINI_API_KEY` | Yes      | Google Gemini AI API key       |
| `OPENAI_API_KEY` | No       | OpenAI API key (fallback)      |
| `NEWS_API_KEY`   | No       | NewsAPI key (for URL fetching) |

## 🎨 Customization

### Styling

- Edit `styles.css` for visual customization
- Modify CSS variables for color scheme changes
- Responsive design uses CSS Grid and Flexbox

### Functionality

- Update `script.js` for UI behavior changes
- Modify `netlify/functions/check-news.js` for analysis logic
- Extend `api-integration.js` for additional API integrations

## 🔒 Security Features

- CORS protection
- Input validation
- XSS protection headers
- Content Security Policy
- Rate limiting (via Netlify)

## 📊 Performance

- Optimized for Core Web Vitals
- Lazy loading for images
- Efficient CSS and JavaScript
- CDN delivery via Netlify
- Serverless functions for scalability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/truthlens/issues)
- **Documentation**: This README
- **Community**: [Discussions](https://github.com/yourusername/truthlens/discussions)

## 🙏 Acknowledgments

- Google Gemini AI for powerful language analysis
- Netlify for seamless deployment
- Font Awesome for icons
- Inter font for typography
- Chart.js for visualizations

---

**Built with ❤️ for fighting misinformation**
