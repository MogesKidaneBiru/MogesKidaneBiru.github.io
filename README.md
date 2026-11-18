# Moges Kidane Biru — personal website

Live at https://mogeskidanebiru.github.io (GitHub Pages).

## How it works
- All text lives in `data/*.json`. The HTML pages only display it.
- Photos go in `images/`. The CV PDF goes in `files/`.
- Editing without code: log in at https://app.pagescms.org with GitHub, pick this repo, and use the forms (config in `.pages.yml`).

## Add an update (news item)
1. Pages CMS → **Updates (news)** → add an item.
2. Give it a short ID with no spaces (e.g. `canvas-2026`), a title, date as `YYYY-MM`, category, image, summary, and full text.
3. Save. The site refreshes in about a minute. The newest three appear on the home page.

## Add a paper
Pages CMS → **Publications** → add to *Published papers*. Paste the citation count from Google Scholar so "Most cited" sorting works.

## Update the CV
Upload the new PDF to `files/`, then set its path in **Site settings → CV file path**.

## Preview locally
`python3 -m http.server` in this folder, then open http://localhost:8000. (Opening the HTML file directly will not load the data.)
