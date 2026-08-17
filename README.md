# Yahtzee Scorecard PWA

A dependency-free, offline-capable Yahtzee scorecard Progressive Web App.

## Features
- Unlimited players
- Built-in dice roller
- Hold/unhold dice between rolls
- Three rolls per turn
- Standard 13 Yahtzee categories
- Automatic upper-section bonus at 63+
- Yahtzee scoring and all standard lower-section scoring
- LocalStorage persistence
- Manual scorecard editing for games using physical dice
- Manual dice mode: tap each die to cycle through values 1–6
- Installable/offline PWA
- No macros, frameworks, backend, or external dependencies

## Run locally

Because service workers require a secure context, use a local static server rather than opening `index.html` directly.

Python:
```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

Upload the contents of this folder to any static HTTPS host such as GitHub Pages, Netlify, Cloudflare Pages, or similar. The included manifest and service worker make it installable as a PWA.

## Notes

The app intentionally keeps all game state in the browser's localStorage. Starting a new game resets scores but preserves the current player names.
