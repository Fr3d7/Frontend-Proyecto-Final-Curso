import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';

// Mock de fetch global para que el componente se renderice correctamente
beforeEach(() => {
  global.fetch = jest.fn((url, opts) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    
    // Login/Register - respuesta por defecto exitosa
    if (urlStr.includes('/login') || urlStr.includes('/register') || urlStr.includes('/auth') || urlStr.includes('/Usuarios')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          token: 'fake-token-123',
          usuario: { id: 1, nombre: 'Test User', correo: 'test@test.com' }
        }),
        headers: new Headers(),
        statusText: 'OK'
      });
    }
    
    // Proyectos - respuesta por defecto
    if (urlStr.includes('/projects') || urlStr.includes('/proyectos')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [],
        headers: new Headers(),
        statusText: 'OK'
      });
    }
    
    // Por defecto: respuesta exitosa vacía
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
      headers: new Headers(),
      statusText: 'OK'
    });
  });
  
  localStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

test('App component renders without crashing', () => {
  render(<App />);
  // Verificar que el componente se renderiza buscando elementos comunes
  expect(screen.getByText(/Login|Proyectos/i)).toBeInTheDocument();
});

test('App renders login form initially', () => {
  render(<App />);
  // Verificar elementos del formulario de login
  expect(screen.getByPlaceholderText(/Correo|Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/contrasena|password/i)).toBeInTheDocument();
});
