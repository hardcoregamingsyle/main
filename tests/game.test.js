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

  test('Game container exists with correct id', () => {
    const container = dom.window.document.getElementById('game-container');
    expect(container).not.toBeNull();
  });

  test('Canvas element exists inside game container', () => {
    const canvas = dom.window.document.getElementById('game-canvas');
    expect(canvas).not.toBeNull();
    const container = dom.window.document.getElementById('game-container');
    expect(container.contains(canvas)).toBe(true);
  });
});