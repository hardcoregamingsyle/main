# Deploying Flappy Bird to Cloudflare Pages

This guide covers two methods: **Git-based deployment** (recommended) and **Direct Upload via Wrangler CLI**.

## Prerequisites

- A Cloudflare account (free tier works)
- The project's source code (this repo)
- Node.js and npm installed locally

## Method 1: Deploy via Git (GitHub / GitLab)

1. Push this repository to a GitHub or GitLab repository.
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Pages**.
3. Click **Create a project** > **Connect to Git**.
4. Select your repository and configure the build settings:
   - **Framework preset**: None (or leave blank)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. Click **Save and Deploy**. Cloudflare will automatically build and deploy your site on every push to the main branch.

## Method 2: Deploy via Wrangler CLI

1. Install Wrangler: `npm install -g wrangler`
2. Log in: `wrangler login`
3. In the project root, create a `wrangler.toml` file (optional but recommended):
   ```toml
   name = "flappy-bird"
   pages_build_output_dir = "dist"
   ```
4. Build the project locally: `npm run build`
5. Deploy: `npx wrangler pages deploy dist --project-name=flappy-bird`
   (The first time it will prompt you to create the project.)

## Local Development

```bash
npm install
npm run dev    # Webpack dev server with live reload
npm run build  # Production build to dist/
npm run preview # Serve the built app locally
```

## Build Setup

The project uses Webpack to bundle `src/game.js` and `src/index.html` into the `dist/` folder. The configuration is in `webpack.config.js`.

After deployment, your game will be live at `https://<project-name>.pages.dev`.
