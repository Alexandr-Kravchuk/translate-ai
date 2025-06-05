describe('script.js', () => {
  let originalFetch;

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="api-key" />
      <button id="swap"></button>
      <select id="direction">
        <option value="ua-pl">UA → PL</option>
        <option value="pl-ua">PL → UA</option>
      </select>
      <button id="translate"></button>
      <textarea id="input"></textarea>
      <select id="tone">
        <option value="friendly">friendly</option>
        <option value="formal">formal</option>
      </select>
      <textarea id="output"></textarea>
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
    const dir = document.getElementById('direction');
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    dir.value = 'ua-pl';
    input.value = 'a';
    output.value = 'b';
    document.getElementById('swap').click();
    expect(dir.value).toBe('pl-ua');
    expect(input.value).toBe('b');
    expect(output.value).toBe('a');
    document.getElementById('swap').click();
    expect(dir.value).toBe('ua-pl');
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
    document.getElementById('direction').value = 'ua-pl';
    document.getElementById('tone').value = 'friendly';
    document.getElementById('translate').click();
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
    document.getElementById('translate').click();
    await new Promise(r => setTimeout(r, 0));
    expect(document.getElementById('output').value).toBe('fail');
  });

  test('translate button handles fetch failure', async () => {
    require('../script.js');
    global.fetch.mockRejectedValue(new Error('network'));
    document.getElementById('input').value = 'text';
    document.getElementById('translate').click();
    await new Promise(r => setTimeout(r, 0));
    expect(document.getElementById('output').value).toBe('Error');
  });

  test('does not call fetch when text is empty', async () => {
    require('../script.js');
    document.getElementById('input').value = '';
    document.getElementById('translate').click();
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
