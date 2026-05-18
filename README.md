# OMAD Fast

OMAD Fast is a lightweight, installable web app for tracking **One Meal A Day (OMAD)** fasting sessions.

It runs fully in the browser, works offline, and stores your data on your device.

## What you can do

- Start and stop fasting sessions with a live timer
- See fasting stage progression and stage-specific benefits
- Tag fasts (meal/activity) to personalize stage timing
- View fast history with stats (count, average, longest)
- Edit or delete history entries
- Export and import backups as JSON
- Install as a PWA on mobile or desktop

## Quick start

No build step is required.

1. From the project directory, start a local server:

```bash
python3 -m http.server 8000
```

2. Open:

```text
http://localhost:8000
```

> Service workers require HTTP(S), so don’t open the app with `file://`.

## Install as an app (PWA)

- Open the app in a supported browser (Chrome, Edge, Safari iOS, etc.)
- Use the browser’s **Install app** / **Add to Home Screen** option
- Launch it like a native app after installation

## Data and privacy

- Data is stored locally in your browser (`localStorage`)
- No backend or account is required
- Use **Backup & restore** in the History view to move or recover data

## Project files

- `index.html` — app layout and UI structure
- `app.js` — app logic (timer, history, tags, backup/restore, PWA update banner)
- `styles.css` — all styling
- `service-worker.js` — offline caching
- `manifest.json` / `icon.svg` — install metadata and icon

## Notes

This app is for tracking and motivation, not medical advice.
