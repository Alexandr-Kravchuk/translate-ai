const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo';

app.post('/translate', async (req, res) => {
  const { text, direction, tone } = req.body;
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }

  const [from, to] = direction.split('-');
  const style = tone === 'formal' ? 'офіційно' : 'дружньо';
  const prompt = `Переклади з ${from === 'ua' ? 'української' : 'польської'} ` +
    `на ${to === 'ua' ? 'українську' : 'польську'} ${style}.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).send(error);
    }

    const data = await response.json();
    const translation = data.choices[0].message.content.trim();
    res.json({ translation });
  } catch (err) {
    res.status(500).json({ error: 'Translation failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
