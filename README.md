# JobClock PWA

A simple installable job timer that works in Safari and can be added to an iPhone Home Screen.

## Features
- Job/customer name
- Notes
- Start and stop timer
- Timer survives closing/reopening the page
- Saved job history
- Delete individual jobs
- Clear all history
- Local storage on the device
- Offline support after the first successful load
- iPhone Home Screen support

## Important: how to run it
PWAs need to be served over HTTPS (or localhost). Opening `index.html` directly as a file is not enough for the service worker/install behavior.

### Easiest deployment options
Upload the contents of this folder to any static HTTPS host, such as:
- GitHub Pages
- Netlify
- Cloudflare Pages
- Vercel

Then open the HTTPS address in Safari on the iPhone.

### Add to iPhone Home Screen
1. Open the hosted JobClock URL in Safari.
2. Tap the Share button.
3. Tap **Add to Home Screen**.
4. Tap **Add**.

JobClock will then launch from its own Home Screen icon in a standalone app-like window.

## Data
Jobs are stored in the browser's localStorage on that device. This version does not sync to a server or another phone.
