# Deploy: GitHub → Vercel (free)

This folder is a working static site. There's no build step — Vercel serves the
files as-is.

## 1. Commit (already done for you)

The project is a git repo with a first commit. If you're starting fresh:

```bash
git init
git add .
git commit -m "Venture notes site"
```

## 2. Push to GitHub

Create an empty repo at https://github.com/new — name it `venture-notes`. Do
**not** add a README, license, or .gitignore (you already have commits). Then:

```bash
git remote add origin https://github.com/<your-username>/venture-notes.git
git branch -M main
git push -u origin main
```

Or, with the GitHub CLI, from this folder:

```bash
gh repo create venture-notes --public --source=. --push
```

## 3. Connect Vercel

1. Sign in at https://vercel.com with your GitHub account.
2. **Add New → Project**, then import the `venture-notes` repo.
3. Framework preset: **Other**. Leave the build command empty; output
   directory root (`./`). There is no build step.
4. **Deploy.** You'll get a `venture-notes.vercel.app` URL in under a minute.

Every push to `main` redeploys automatically.

## 4. Custom domain (optional)

Vercel project → **Settings → Domains → Add**. Set the A record or CNAME it
gives you at your registrar. The free tier includes the SSL certificate.

## After you have the real URL

The canonical/Open Graph URLs and `sitemap.xml`/`robots.txt` currently use
`https://venture-notes.vercel.app`. If your deployed URL or custom domain
differs, find-and-replace that string across `index.html`, `posts/*.html`,
`sitemap.xml`, and `robots.txt`, then commit and push.
