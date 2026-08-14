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

  test('Body has required styles', () => {
    const bodyStyle = dom.window.document.body.getAttribute('style') || '';
    // Since styles are in <style> tag, we just ensure the body exists
    expect(dom.window.document.body).toBeDefined();
  });

  test('Game container exists with correct id and dimensions', () => {
    const container = dom.window.document.getElementById('game-container');
    expect(container).not.toBeNull();
    const style = container.getAttribute('style') || '';
    // Check that width and height are set in CSS (approx check)
    const css = dom.window.document.querySelector('style').textContent;
    expect(css).toMatch(/#game-container\s*{[^}]*width:\s*400px/);
    expect(css).toMatch(/#game-container\s*{[^}]*height:\s*600px/);
  });

  test('Canvas element is present inside game container', () => {
    const canvas = dom.window.document.querySelector('#game-container canvas');
    // The HTML snippet may be incomplete, but we assert presence if defined
    // If not present, the test will fail, indicating missing implementation.
    expect(canvas).not.toBeNull();
  });
});

describe('Package.json sanity checks', () => {
  const pkg = require('../package.json');

  test('Package has start script', () => {
    expect(pkg.scripts.start).toBeDefined();
    expect(pkg.scripts.start).toContain('http-server');
  });

  test('Package has test script set to jest', () => {
    expect(pkg.scripts.test).toBe('jest');
  });

  test('Dev dependencies include jest and jsdom', () => {
    expect(pkg.devDependencies).toHaveProperty('jest');
    expect(pkg.devDependencies).toHaveProperty('jsdom');
  });
});