# Deploying to Cloudflare Pages

This is a static site (HTML, CSS, JavaScript) with no backend, so Cloudflare Pages is a perfect fit.

## Option 1: Git integration (recommended)

1. Push the project to GitHub (or GitLab).
2. Go to Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Select the repository.
4. Build settings:
   - Framework preset: None
   - Build command: `npm run build` (or leave empty if you don't use webpack)
   - Build output directory: `dist` (or `src` if you don't build)
   - Node version: 18+
5. Click Save and Deploy.

Every push to the branch triggers a new deployment.

## Option 2: Serve directly from `src`

If you don't want a build step, set:
- Build command: (empty)
- Build output directory: `src`

Cloudflare will serve `src/index.html` and its assets as-is.

## Option 3: Direct Upload with Wrangler

```bash
npx wrangler pages deploy src
```

This uploads the `src` folder directly.

## Custom Domain

In the Cloudflare Pages project, go to the "Custom domains" tab to add your own domain.