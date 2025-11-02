import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import App from '../App';

test('App renders', () => {
  render(<App />);
  expect(true).toBe(true);
});
