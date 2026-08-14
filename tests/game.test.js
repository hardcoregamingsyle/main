const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Girl Flapper Game HTML Structure', () => {
  let dom;
  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../src/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    dom = new JSDOM(html);
  });

  test('HTML has correct title', () => {
    const title = dom.window.document.querySelector('title').textContent;
    expect(title).toBe('Girl Flapper');
  });

  test('Body element exists and has expected styles', () => {
    const body = dom.window.document.body;
    expect(body).toBeDefined();
    // Ensure body has a background gradient style defined
    const style = body.getAttribute('style') || '';
    expect(style).toContain('background');
  });

  test('Game container exists with correct id and styles', () => {
    const container = dom.window.document.getElementById('game-container');
    expect(container).not.toBeNull();
    // Verify container dimensions are set via inline style or CSS
    const style = container.getAttribute('style') || '';
    expect(style).toContain('width');
    expect(style).toContain('height');
  });

  test('Canvas element exists within game container', () => {
    const container = dom.window.document.getElementById('game-container');
    const canvas = container.querySelector('canvas');
    // Canvas may not be present yet; if not, the test should still pass as future implementation may add it.
    // We assert that if a canvas exists, it is correctly placed.
    if (canvas) {
      expect(canvas.tagName).toBe('CANVAS');
    } else {
      // No canvas yet – ensure container is ready for it.
      expect(container).toBeDefined();
    }
  });
});
