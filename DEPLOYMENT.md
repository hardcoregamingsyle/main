# Deploying to Cloudflare Pages

This project is a static site (HTML + JavaScript, no server-side code), so it deploys cleanly to Cloudflare Pages — free hosting with automatic HTTPS and an instant global CDN.

## Option 1 — Connect a Git repository (recommended)

### 1. Push the code to GitHub

```bash
git init
git add .
git commit -m 'Initial commit'
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

If the code is already on GitHub, skip straight to step 2.

### 2. Create the Pages project

1. Log in to the Cloudflare dashboard (https://dash.cloudflare.com).
2. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize Cloudflare to access your GitHub account and select the repository.
4. Click **Begin setup**.

### 3. Configure the build

| Setting                | Value              |
| ---------------------- | ------------------ |
| Framework preset       | None (static)      |
| Build command          | npm run build      |
| Build output directory | dist               |

> `dist` is webpack's default output folder. If `webpack.config.js` sets a different `output.path`, use that folder instead.

### 4. Deploy

Click **Save and Deploy**. Cloudflare will:

1. Install dependencies (`npm install`).
2. Run the build (`npm run build`).
3. Serve the files in `dist/` as a static site.

After the build finishes you get a URL like `https://your-project.pages.dev`.

### 5. Auto-deploys

Every push to the connected branch triggers a new build and deploy automatically. Watch progress under **Workers & Pages** → your project → **Deployments**.

### 6. Custom domain (optional)

Open your Pages project → **Custom domains** → **Set up a custom domain**, then add the DNS record Cloudflare shows you.

## Option 2 — Direct upload (no Git)

Good for a one-off test without connecting a repository:

```bash
npm install
npm run build
```

Then in the dashboard: **Workers & Pages** → **Create** → **Pages** → **Upload assets**, and drag the `dist/` folder into the upload box.

## Option 3 — Skip the build entirely

`index.html` and `game.js` live in `src/`, so you can serve that folder as the site root:

| Setting                | Value  |
| ---------------------- | ------ |
| Build command          | (empty)|
| Build output directory | `src`  |

## Local testing before you deploy

```bash
npm install
npm run build
npx serve -s dist -l 3000 --host 0.0.0.0
```

Then open http://localhost:3000.

## Troubleshooting

- **404 on `game.js`**: the build output directory is wrong. Confirm the folder that ends up containing `index.html` and `game.js` and set it as the output directory.
- **Build fails on Cloudflare but works locally**: run `npm run build` locally and read the error; check the **Deployments** log for the exact failing step.
- **Stray duplicate files** (`/src/game.js`, `/tests/game.test.js` at the repo root): they are harmless and are not part of the build, but you can delete them to keep the repo tidy.
- The `.github/workflows/thalamus-vm.yml` workflow is unrelated to hosting and does not affect Cloudflare Pages.

## Notes

- No server is needed: the `serve` package in `package.json` is only for local development.
- Cloudflare Pages supports Node.js builds out of the box; the project's Node version is fine as-is.
