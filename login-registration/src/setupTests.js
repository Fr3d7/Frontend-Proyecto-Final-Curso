// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock de fetch global para TODOS los tests
beforeEach(() => {
  global.fetch = jest.fn((url, opts) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    
    // Login exitoso
    if (urlStr.includes('/login') || urlStr.includes('/auth/login')) {
      const body = opts?.body ? JSON.parse(opts.body) : {};
      if (body.correo === 'test@test.com' && body.contrasena === 'password123') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            token: 'fake-token-123',
            usuario: {
              id: 1,
              nombre: 'Test User',
              correo: 'test@test.com'
            }
          }),
          headers: new Headers(),
          statusText: 'OK'
        });
      }
      // Login fallido
      return Promise.resolve({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Correo o contraseña incorrectos' }),
        headers: new Headers(),
        statusText: 'Unauthorized'
      });
    }
    
    // Registro exitoso
    if (urlStr.includes('/register') || urlStr.includes('/auth/register') || urlStr.includes('/registro')) {
      return Promise.resolve({
        ok: true,
        status: 201,
        json: async () => ({
          message: 'Usuario registrado exitosamente',
          usuario: {
            id: 1,
            nombre: 'Test User',
            correo: 'test@test.com'
          }
        }),
        headers: new Headers(),
        statusText: 'Created'
      });
    }
    
    // Obtener proyectos
    if ((urlStr.includes('/projects') || urlStr.includes('/proyectos')) && opts?.method === 'GET') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 1,
            name: 'Proyecto 1',
            description: 'Descripción del proyecto 1',
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            creator: 'test@test.com',
            createdAt: '2025-01-01T00:00:00.000Z'
          }
        ],
        headers: new Headers(),
        statusText: 'OK'
      });
    }
    
    // Crear proyecto
    if ((urlStr.includes('/projects') || urlStr.includes('/proyectos')) && opts?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        status: 201,
        json: async () => ({
          id: Date.now(),
          name: JSON.parse(opts.body).name || 'Nuevo Proyecto',
          description: JSON.parse(opts.body).description || '',
          startDate: JSON.parse(opts.body).startDate || '',
          endDate: JSON.parse(opts.body).endDate || '',
          creator: 'test@test.com',
          createdAt: new Date().toISOString()
        }),
        headers: new Headers(),
        statusText: 'Created'
      });
    }
    
    // Actualizar proyecto
    if ((urlStr.includes('/projects') || urlStr.includes('/proyectos')) && (opts?.method === 'PUT' || opts?.method === 'PATCH')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => JSON.parse(opts.body),
        headers: new Headers(),
        statusText: 'OK'
      });
    }
    
    // Eliminar proyecto
    if ((urlStr.includes('/projects') || urlStr.includes('/proyectos')) && opts?.method === 'DELETE') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ message: 'Proyecto eliminado' }),
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
  
  // Limpiar localStorage
  localStorage.clear();
  
  // Limpiar mocks
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});