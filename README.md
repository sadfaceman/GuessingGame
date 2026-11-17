# Little Codebreaker

A build-free, static guessing game. The page and its assets can be served directly by GitHub Pages.

## Run locally

Serve the repository over HTTP (ES modules do not load from `file://` URLs):

```powershell
py -m http.server 8000
```

Then open <http://localhost:8000>.

## Publish with GitHub Pages

1. Push this repository to GitHub on the `main` or `master` branch.
2. In **Settings → Pages**, set the source to **GitHub Actions**.
3. The workflow deploys on each push; find the published URL in the **Deploy to GitHub Pages** workflow run.
