# Deployment Guide

This project is configured for deployment on multiple platforms. Choose the one that best fits your needs:

## Option 1: GitHub Pages (Recommended - Free)

### Setup:
1. Go to your GitHub repository: https://github.com/Sai-Emani25/Solomon-s-Workspace
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: Select **GitHub Actions**
4. Go to **Settings** → **Secrets and variables** → **Actions**
5. Click **New repository secret**
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key
6. Push your code to the `main` branch

### Deploy:
The GitHub Actions workflow will automatically build and deploy your app when you push to the `main` branch.

Your site will be available at: `https://sai-emani25.github.io/Solomon-s-Workspace/`

---

## Option 2: Vercel (Easy & Fast)

### Setup:
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel login`
3. Run: `vercel`
4. Follow the prompts
5. Add environment variable:
   - Go to your project settings on Vercel dashboard
   - Add `GEMINI_API_KEY` with your API key

### Deploy:
- **Production**: `vercel --prod`
- **Preview**: `vercel`

Or connect your GitHub repository to Vercel for automatic deployments.

---

## Option 3: Netlify

### Setup:
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run: `netlify login`
3. Run: `netlify init`
4. Follow the prompts
5. Add environment variable:
   - Go to Site settings → Environment variables
   - Add `GEMINI_API_KEY` with your API key

### Deploy:
- `netlify deploy --prod`

Or connect your GitHub repository to Netlify for automatic deployments.

---

## Manual Build

To build locally:
```bash
npm install
npm run build
```

The build output will be in the `dist` folder.

---

## Environment Variables

All deployment platforms need the following environment variable:
- `GEMINI_API_KEY`: Your Google Gemini API key

Make sure to add this to your deployment platform's environment variables settings.
