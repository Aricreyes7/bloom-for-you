# Bloom For You — Netlify protected flower surprise

This revision preserves the visual design from the supplied HTML: animated purple gradient, floating particles, glassmorphism login card, pink glowing flower, green stem and leaves, floating hearts, and a bloom-again button. The original hard-coded browser-side password check has been replaced by server-side Netlify Functions.

## Files
- `public/index.html` — public login page and animation styles
- `netlify/functions/login.mjs` — server-side credential check and signed session cookie
- `netlify/functions/flower.mjs` — verifies the session before returning the flower reveal
- `netlify.toml` — Netlify build and Functions configuration

## Configure Netlify environment variables
In your Netlify project settings, add these variables and ensure they are available to Functions:

| Variable | Value |
|---|---|
| `FLOWER_USERNAME` | `love` |
| `FLOWER_PASSWORD` | `1234` |
| `FLOWER_MESSAGE` | `You make my world bloom. 🌷` |
| `SESSION_SECRET` | Generate a long random secret |

Generate a 48-byte secret using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Do not put secrets in HTML, JavaScript, `netlify.toml`, or a public repository. The requested password `1234` is weak; replace it with a longer unique password before sharing the site.

## Deploy
1. Upload this folder structure to a GitHub repository.
2. In Netlify choose **Add new project → Import an existing project** and connect the repository.
3. Set publish directory to `public`; leave build command blank.
4. Deploy the site.
5. Add the four environment variables above (Functions scope).
6. Trigger a fresh deployment after adding variables.
7. Visit the generated `netlify.app` URL and test login.

## Optional local test
Install Netlify CLI: `npm install -g netlify-cli`

In PowerShell, set variables for the current terminal session:
```powershell
$env:FLOWER_USERNAME="love"
$env:FLOWER_PASSWORD="1234"
$env:FLOWER_MESSAGE="You make my world bloom. 🌷"
$env:SESSION_SECRET="paste-your-generated-secret-here"
netlify dev
```

## Security behavior
The credentials are checked only by the server function. A successful login sets a signed HMAC-SHA256 cookie with HttpOnly, Secure, SameSite=Strict attributes and a one-hour expiry. The reveal HTML and message are returned only after the server verifies the session. This small project does not include persistent rate limiting; use a strong password and consider platform/WAF rate limits if the site will be widely exposed.
