const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Girl Flapper Game HTML Structure', () => {
  let dom;
  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../src/index.html'), 'utf8');
    dom = new JSDOM(html);
  });

  test('HTML has correct title', () => {
    const title = dom.window.document.querySelector('title').textContent;
    expect(title).toBe('Girl Flapper');
  });

  test('Body element exists', () => {
    const body = dom.window.document.body;
    expect(body).toBeDefined();
  });

  test('Game container exists with correct id and dimensions', () => {
    const container = dom.window.document.getElementById('game-container');
    expect(container).not.toBeNull();
    expect(container.style.width).toBe('400px'); // Inline style not set, but we can check attribute
    // Verify dimensions via computed style fallback
    const computed = dom.window.getComputedStyle(container);
    expect(computed.width).toBe('400px');
    expect(computed.height).toBe('600px');
  });

  test('Canvas element exists inside the game container', () => {
    const canvas = dom.window.document.getElementById('game-canvas');
    expect(canvas).not.toBeNull();
    expect(canvas.parentElement.id).toBe('game-container');
  });
});
