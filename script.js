document.getElementById('swap').addEventListener('click', () => {
  const dir = document.getElementById('direction');
  dir.value = dir.value === 'ua-pl' ? 'pl-ua' : 'ua-pl';
});

const settingsBtn = document.getElementById('settings-btn');
const settings = document.getElementById('settings');
if (settingsBtn && settings) {
  settingsBtn.addEventListener('click', () => {
    settings.classList.toggle('show');
  });
}

const API_BASE = window.API_BASE || '';
const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo';

const API_KEY_STORAGE = 'openai-api-key';

const apiKeyInput = document.getElementById('api-key');
if (apiKeyInput) {
  const saved = localStorage.getItem(API_KEY_STORAGE);
  if (saved) {
    apiKeyInput.value = saved;
  }
  apiKeyInput.addEventListener('input', () => {
    const val = apiKeyInput.value.trim();
    if (val) {
      localStorage.setItem(API_KEY_STORAGE, val);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  });
}

function getApiKey() {
  return document.getElementById('api-key')?.value.trim();
}

async function translate() {
  const text = document.getElementById('input').value.trim();
  const tone = document.getElementById('tone').value;
  const direction = document.getElementById('direction').value;
  if (!text) return;
  try {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, direction, tone })
      });
      const data = await res.json();
      if (data.translation) {
        document.getElementById('output').value = data.translation;
      } else {
        document.getElementById('output').value = data.error || 'Error';
      }
    } else {
      const apiKey = getApiKey();
      if (!apiKey) {
        document.getElementById('output').value = 'API key required';
        return;
      }
      const [from, to] = direction.split('-');
      const style = tone === 'formal' ? 'офіційно' : 'дружньо';
      const prompt = `Переклади з ${from === 'ua' ? 'української' : 'польської'} на ${to === 'ua' ? 'українську' : 'польську'} ${style}.`;

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: prompt },
            { role: 'system', content: tone === 'formal' ? 'Використовуй офіційний тон.' : 'Використовуй дружній тон.' },
            { role: 'user', content: text }
          ]
        })
      });
      const data = await res.json();
      if (data.choices && data.choices[0]) {
        document.getElementById('output').value = data.choices[0].message.content.trim();
      } else {
        document.getElementById('output').value = 'Error';
      }
    }
  } catch (e) {
    document.getElementById('output').value = 'Error';
  }
}

const translateBtn = document.getElementById('translate');
if (translateBtn) {
  translateBtn.addEventListener('click', translate);
}

const inputField = document.getElementById('input');
if (inputField) {
  inputField.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      translate();
    }
  });
}
