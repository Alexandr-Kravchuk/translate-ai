document.getElementById('swap').addEventListener('click', () => {
  const dir = document.getElementById('direction');
  dir.value = dir.value === 'ua-pl' ? 'pl-ua' : 'ua-pl';
});

document.getElementById('translate').addEventListener('click', async () => {
  const text = document.getElementById('input').value.trim();
  const tone = document.getElementById('tone').value;
  const direction = document.getElementById('direction').value;
  if (!text) return;
  try {
    const res = await fetch('/translate', {
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
  } catch (e) {
    document.getElementById('output').value = 'Error';
  }
});
