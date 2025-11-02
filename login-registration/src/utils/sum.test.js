import { sum } from './sum';

test('adds 2 + 3 = 5', () => {
  expect(sum(2, 3)).toBe(5);
});

test('adds 1 + 1 = 2', () => {
  expect(sum(1, 1)).toBe(2);
});

test('adds 0 + 0 = 0', () => {
  expect(sum(0, 0)).toBe(0);
});

