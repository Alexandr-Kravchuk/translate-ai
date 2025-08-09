# Translate AI

Simple web-based translator between Ukrainian and Polish using ChatGPT API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Open `index.html` in your browser or serve the directory with any static server.

### Deployment notes

You can host the static files on any HTTP server. If you also deploy a custom
backend for the `/translate` endpoint, set a global `API_BASE` variable before
loading `script.js` to point to that server:

```html
<script>
  window.API_BASE = 'https://your-server-domain';
</script>
<script src="script.js"></script>
```

If you host only the static files, provide an OpenAI API key in the "OpenAI API
Key" field that appears above the text area. The page will send requests
directly to the OpenAI API using this key. **Be aware** that anyone who can
access the page can view this key, so use it only for personal experiments.

Use the dropdowns to set translation tone (friendly or formal) and direction.
The swap button flips the translation direction.

### Example API Request

To directly call the OpenAI API for translating from Ukrainian to Polish you can
send the following JSON payload:

```http
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "model": "gpt-5-nano",
  "messages": [
    {
      "role": "system",
      "content": "Ти професійний перекладач з української на польську. Перекладай точно і природно."
    },
    {
      "role": "user",
      "content": "Переклади фразу: \"Моя донька любить морозиво і котиків.\""
    }
  ],
  "temperature": 0.2
}
```

The expected response contains the translated phrase in `choices[0].message.cont
ent`:

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Moja córka lubi lody i kotki."
      }
    }
  ]
}
```
