describe('script.js', () => {
  let originalFetch;

  beforeEach(() => {
    document.body.innerHTML = `
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
    originalFetch = global.fetch;
    global.fetch = jest.fn();
    jest.resetModules();
    require('../public/script.js');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('swap button toggles direction', () => {
    const dir = document.getElementById('direction');
    dir.value = 'ua-pl';
    document.getElementById('swap').click();
    expect(dir.value).toBe('pl-ua');
    document.getElementById('swap').click();
    expect(dir.value).toBe('ua-pl');
  });

  test('translate button shows translation on success', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ translation: 'hello' }),
    });
    document.getElementById('input').value = 'test';
    document.getElementById('direction').value = 'ua-pl';
    document.getElementById('tone').value = 'friendly';
    document.getElementById('translate').click();
    await new Promise(r => setTimeout(r, 0));
    expect(global.fetch).toHaveBeenCalledWith('/translate', expect.objectContaining({
      method: 'POST',
    }));
    expect(document.getElementById('output').value).toBe('hello');
  });

  test('translate button shows error message', async () => {
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
    global.fetch.mockRejectedValue(new Error('network'));
    document.getElementById('input').value = 'text';
    document.getElementById('translate').click();
    await new Promise(r => setTimeout(r, 0));
    expect(document.getElementById('output').value).toBe('Error');
  });

  test('does not call fetch when text is empty', async () => {
    document.getElementById('input').value = '';
    document.getElementById('translate').click();
    await new Promise(r => setTimeout(r, 0));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
