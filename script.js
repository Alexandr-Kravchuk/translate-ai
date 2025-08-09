document.getElementById('swap').addEventListener('click', () => {
        const current = document.querySelector('.direction-btn.active');
        if (!current) return;
        const next = current.dataset.value === 'ua-pl'
                ? document.querySelector('.direction-btn[data-value="pl-ua"]')
                : document.querySelector('.direction-btn[data-value="ua-pl"]');
        if (next) {
                current.classList.remove('active');
                next.classList.add('active');
        }
        const input = document.getElementById('input');
        const output = document.getElementById('output');
        if (input && output) {
                const tmp = input.value;
                input.value = output.value;
                output.value = tmp;
        }
});

const settingsBtn = document.getElementById('settings-btn');
const settings = document.getElementById('settings');
if (settingsBtn && settings) {
        settingsBtn.addEventListener('click', () => {
                settings.classList.toggle('show');
        });
}

document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.addEventListener('click', () => {
                document.querySelectorAll('.direction-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
        });
});

const API_BASE = window.API_BASE || '';
const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-5-nano';

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

async function translate(tone, btn) {
        const text = document.getElementById('input').value.trim();
        const direction = document.querySelector('.direction-btn.active')?.dataset.value || 'ua-pl';
        const original = btn ? btn.innerHTML : '';
        if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        if (!text) {
                if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = original;
                }
                return;
        }
        try {
                if (API_BASE) {
                        const res = await fetch(`${API_BASE}/translate`, {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({text, direction, tone})
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
                        const base = `You are a professional translator from ${from === 'ua' ? 'Ukrainian' : 'Polish'} to ${to === 'ua' ? 'Ukrainian' : 'Polish'}. Translate accurately and naturally.`;
                        const toneNote = tone === 'formal'
                                ? 'Use a formal tone.'
                                : 'Use a friendly tone.';

                        const res = await fetch(API_URL, {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${apiKey}`
                                },
                                body: JSON.stringify({
                                        model: MODEL,
                                        messages: [
                                                {role: 'system', content: `${base} ${toneNote}`},
                                                {role: 'user', content: `Translate the phrase: ${text}`}
                                        ]
                                })
                        });
                        if (!res.ok) {
                                const errorData = await res.json();
                                document.getElementById('output').value = errorData.error?.message || 'Error';
                                return;
                        }
                        const data = await res.json();
                        const result = data.choices?.[0]?.message?.content?.trim() || '';
                        document.getElementById('output').value = result;
                }
        } catch (e) {
                document.getElementById('output').value = 'Error';
        } finally {
                if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = original;
                }
        }
}

const friendlyBtn = document.getElementById('translate-friendly');
if (friendlyBtn) {
        friendlyBtn.addEventListener('click', () => translate('friendly', friendlyBtn));
}

const formalBtn = document.getElementById('translate-formal');
if (formalBtn) {
        formalBtn.addEventListener('click', () => translate('formal', formalBtn));
}

const clearInputBtn = document.getElementById('clear-input');
if (clearInputBtn) {
        clearInputBtn.addEventListener('click', () => {
                const input = document.getElementById('input');
                if (input) input.value = '';
        });
}

const copyInputBtn = document.getElementById('copy-input');
if (copyInputBtn) {
        copyInputBtn.addEventListener('click', async () => {
                const input = document.getElementById('input');
                try {
                        if (input) await navigator.clipboard.writeText(input.value);
                } catch (e) {
                        /* noop */
                }
        });
}

const copyBtn = document.getElementById('copy-btn');
const outputField = document.getElementById('output');
if (copyBtn && outputField) {
	copyBtn.addEventListener('click', async () => {
		try {
			await navigator.clipboard.writeText(outputField.value);
		} catch (e) {
			/* noop */
		}
	});
}
