import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

const renderProtected = ({ user = null, loading = false, roles = undefined } = {}) => {
  useAuth.mockReturnValue({ user, loading });
  return render(
    <MemoryRouter initialEntries={['/protegido']}>
      <Routes>
        <Route path="/login"      element={<div>Pagina de login</div>} />
        <Route path="/dashboard"  element={<div>Dashboard</div>} />
        <Route element={<ProtectedRoute roles={roles} />}>
          <Route path="/protegido" element={<div>Contenido protegido</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra spinner mientras carga', () => {
    renderProtected({ loading: true });
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('redirige a /login si no hay usuario autenticado', () => {
    renderProtected({ user: null, loading: false });
    expect(screen.getByText('Pagina de login')).toBeInTheDocument();
  });

  it('renderiza el contenido protegido cuando el usuario esta autenticado', () => {
    renderProtected({ user: { rol: 'ciudadano' }, loading: false });
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('redirige a /dashboard si el usuario no tiene el rol requerido', () => {
    renderProtected({ user: { rol: 'ciudadano' }, loading: false, roles: ['admin'] });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('permite acceso si el usuario tiene uno de los roles requeridos', () => {
    renderProtected({ user: { rol: 'moderador' }, loading: false, roles: ['admin', 'moderador'] });
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});
