// Jest setup for canvas mock
const { createCanvas } = require('canvas');

// Provide a mock for HTMLCanvasElement.getContext
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function(contextType) {
    if (contextType === '2d' || contextType === 'webgl') {
      return createCanvas(this.width, this.height).getContext(contextType);
    }
    return null;
  };
}

// Mock for image loading
jest.mock('image-loader', () => ({
  loadImage: jest.fn().mockResolvedValue(createCanvas(1, 1))
}));
