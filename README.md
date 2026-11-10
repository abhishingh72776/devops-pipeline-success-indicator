# DevOps Pipeline Indicator

This repository contains:
- `index.html`, `style.css`, `script.js`: dark-themed dashboard frontend.
- `.github/workflows/ci-cd.yml`: GitHub Actions workflow with Build, Test, and GitHub Pages Deploy jobs.

## Important distinction

The dashboard's **Run Pipeline** button is currently a frontend-only simulation. It does not start GitHub Actions or retrieve real workflow data yet.

The GitHub Actions workflow is real and runs on pushes and manual dispatches. Its Build and Test jobs validate the frontend files and JavaScript syntax. The Deploy job publishes the site to GitHub Pages on the `main` branch.

## Run locally

Open `index.html` in a browser, or use VS Code Live Server.

## Enable GitHub Pages

In the repository, open **Settings → Pages** and set the build/deployment source to **GitHub Actions**. Then push the project to the `main` branch and inspect the **Actions** tab.

## Push changes

```bash
git add .
git commit -m "Add DevOps pipeline dashboard and workflow"
git push origin main
```
