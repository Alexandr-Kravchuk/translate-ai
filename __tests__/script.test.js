describe('script.js', () => {
  let originalFetch;

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="api-key" />
      <button id="swap"></button>
      <button class="direction-btn active" data-value="ua-pl"></button>
      <button class="direction-btn" data-value="pl-ua"></button>
      <button id="translate-friendly"></button>
      <button id="translate-formal"></button>
      <textarea id="input"></textarea>
      <textarea id="output"></textarea>
      <button id="clear-input"></button>
      <button id="copy-input"></button>
      <button id="copy-btn"></button>
    `;
    window.API_BASE = '/api';
    localStorage.clear();
    originalFetch = global.fetch;
    global.fetch = jest.fn();
    jest.resetModules();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('swap button toggles direction and swaps text', () => {
    require('../script.js');
    const ua = document.querySelector('.direction-btn[data-value="ua-pl"]');
    const pl = document.querySelector('.direction-btn[data-value="pl-ua"]');
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    input.value = 'a';
    output.value = 'b';
    document.getElementById('swap').click();
    expect(pl.classList.contains('active')).toBe(true);
    expect(input.value).toBe('b');
    expect(output.value).toBe('a');
    document.getElementById('swap').click();
    expect(ua.classList.contains('active')).toBe(true);
    expect(input.value).toBe('a');
    expect(output.value).toBe('b');
  });

  test('translate button shows translation on success', async () => {
    require('../script.js');
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ translation: 'hello' }),
    });
    document.getElementById('input').value = 'test';
    document.getElementById('translate-friendly').click();
    await new Promise(r => setTimeout(r, 0));
    expect(global.fetch).toHaveBeenCalledWith('/api/translate', expect.objectContaining({
      method: 'POST',
    }));
    expect(document.getElementById('output').value).toBe('hello');
  });

  test('translate button shows error message', async () => {
    require('../script.js');
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ error: 'fail' }),
    });
    document.getElementById('input').value = 'text';
    document.getElementById('translate-friendly').click();
    await new Promise(r => setTimeout(r, 0));
    expect(document.getElementById('output').value).toBe('fail');
  });

  test('translate button handles fetch failure', async () => {
    require('../script.js');
    global.fetch.mockRejectedValue(new Error('network'));
    document.getElementById('input').value = 'text';
    document.getElementById('translate-friendly').click();
    await new Promise(r => setTimeout(r, 0));
    expect(document.getElementById('output').value).toBe('Error');
  });

  test('does not call fetch when text is empty', async () => {
    require('../script.js');
    document.getElementById('input').value = '';
    document.getElementById('translate-friendly').click();
    await new Promise(r => setTimeout(r, 0));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('loads API key from localStorage', () => {
    localStorage.setItem('openai-api-key', 'abc');
    require('../script.js');
    expect(document.getElementById('api-key').value).toBe('abc');
  });

  test('stores API key to localStorage on input', () => {
    require('../script.js');
    const input = document.getElementById('api-key');
    input.value = 'xyz';
    input.dispatchEvent(new Event('input'));
    expect(localStorage.getItem('openai-api-key')).toBe('xyz');
  });
});
