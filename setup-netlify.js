#!/usr/bin/env node

/**
 * Netlify Setup Script for TruthLens
 * This script helps prepare your project for Netlify deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 TruthLens Netlify Setup Script');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created! Please edit it with your actual API keys.\n');
  } else {
    console.log('❌ env.example file not found!\n');
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Check if .gitignore exists
const gitignorePath = path.join(__dirname, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  console.log('📝 Creating .gitignore file...');
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
out/

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Netlify
.netlify/`;
  
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ .gitignore file created!\n');
} else {
  console.log('✅ .gitignore file already exists\n');
}

// Check package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (!packageJson.scripts['netlify:dev']) {
    console.log('📝 Adding Netlify scripts to package.json...');
    packageJson.scripts['netlify:dev'] = 'netlify dev';
    packageJson.scripts['netlify:build'] = 'npm install';
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Netlify scripts added!\n');
  } else {
    console.log('✅ Netlify scripts already exist in package.json\n');
  }
}

// Check netlify.toml
const netlifyPath = path.join(__dirname, 'netlify.toml');
if (fs.existsSync(netlifyPath)) {
  console.log('✅ netlify.toml configuration file exists\n');
} else {
  console.log('❌ netlify.toml file not found!\n');
}

// Check Netlify function
const functionPath = path.join(__dirname, 'netlify', 'functions', 'check-news.js');
if (fs.existsSync(functionPath)) {
  console.log('✅ Netlify function exists\n');
} else {
  console.log('❌ Netlify function not found!\n');
}

console.log('🎯 Next Steps:');
console.log('==============');
console.log('1. Edit .env file with your actual API keys');
console.log('2. Get a Gemini API key from: https://makersuite.google.com/app/apikey');
console.log('3. Push your code to GitHub');
console.log('4. Connect your repository to Netlify');
console.log('5. Set environment variables in Netlify dashboard');
console.log('6. Deploy! 🚀\n');

console.log('📚 For detailed instructions, see: NETLIFY_DEPLOYMENT.md');
console.log('🔧 To test locally: npm run netlify:dev');
