# Manual smoke checklist

Run these checks against the deployed GitHub Pages site in current desktop Chrome or Edge and mobile Safari or Chrome:

1. Open `/dad-a-base/` and confirm the card, styles, icon, and navigation load without console or network errors.
2. Reveal and hide the first punchline; confirm its Steam link opens separately without hiding the punchline.
3. Navigate forward and backward with buttons and arrow keys; confirm wrapping and hidden punchlines on newly selected jokes.
4. Use a narrow mobile viewport and confirm the card and navigation remain within the screen.
5. Install the PWA after an online visit, close it, go offline, and confirm the cached app shell opens.
6. Deploy a newer version while the previous version is open; confirm the update prompt appears and reloads only after selecting **Update**.
7. Confirm a pull request validation run does not create a Pages deployment.
8. Confirm a successful push to `main` creates a Pages deployment from the root-level `dist` artifact.

Record the date, browser/device, deployed commit, and result beside each check in the local evidence package.
