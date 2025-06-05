# Translate AI

Simple web-based translator between Ukrainian and Polish using ChatGPT API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` file with your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your-key
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in your browser.

### Deployment notes

The `/translate` endpoint is served by `server.js` and requires a Node.js
environment. Static hosting services like GitHub Pages do **not** run this
server, so the translate button will fail with a `405 Method Not Allowed` error
if you only deploy the contents of the `public` directory.

To use the application online, deploy the server portion to a service capable of
running Node.js (for example Render, Heroku or another VPS). Then set a global
`API_BASE` variable before loading `script.js` to point to that server:

```html
<script>
  window.API_BASE = 'https://your-server-domain';
</script>
<script src="script.js"></script>
```

When running the frontend and server on the same host (e.g. `localhost`), no
additional configuration is required.

If you host only the static files (for example on GitHub Pages), you can
manually provide the API key in the "OpenAI API Key" field that appears above
the text area. The page will send requests directly to the OpenAI API using this
key. **Be aware** that anyone who can access the page can view this key, so use
it only for personal experiments.

Use the dropdowns to set translation tone (friendly or formal) and direction. The swap button flips the translation direction.
