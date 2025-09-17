const mockAnimation = {
  pause: jest.fn(),
  play: jest.fn(),
  restart: jest.fn(),
  animatables: []
};

const animate = jest.fn(() => mockAnimation);
const createTimeline = jest.fn(() => ({
  add: jest.fn().mockReturnThis(),
  ...mockAnimation
}));
const stagger = jest.fn((value) => value);
const utils = {
  random: jest.fn((min, max) => Math.random() * (max - min) + min),
  remove: jest.fn()
};

module.exports = {
  animate,
  createTimeline,
  stagger,
  utils,
  timeline: createTimeline,
  random: utils.random,
  remove: utils.remove,
  default: animate
};