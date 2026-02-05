<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1gId1xO4c_N62lIMGoiFW8yydc5H_6kKO

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file from the example:
   ```bash
   cp .env.example .env.local
   ```

3. Set your `GEMINI_API_KEY` in `.env.local` to your Gemini API key

4. Run the app:
   ```bash
   npm run dev
   ```

## Deployment

This project is ready to deploy on multiple platforms. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to:
- **GitHub Pages** (Free, automated with GitHub Actions)
- **Vercel** (Easy setup, automatic deployments)
- **Netlify** (Simple and fast)
