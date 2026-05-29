import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Auth from './Auth';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    loginWithGoogle: vi.fn(),
    loginWithFacebook: vi.fn(),
  })),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
}));

vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: vi.fn(() => vi.fn()),
}));

vi.mock('../components/NebulaBackground', () => ({
  default: () => <div data-testid="nebula-bg" />,
}));

vi.mock('../components/PasswordStrengthIndicator', () => ({
  default: () => <div data-testid="password-strength" />,
}));

const renderAuth = (path = '/login') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Auth />
    </MemoryRouter>
  );

describe('Auth', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza el fondo nebula', () => {
    renderAuth('/login');
    expect(screen.getByTestId('nebula-bg')).toBeInTheDocument();
  });

  it('muestra boton de Iniciar sesion en modo login', () => {
    renderAuth('/login');
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra boton de Crear cuenta en modo register', () => {
    renderAuth('/register');
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('muestra campo de correo electronico', () => {
    renderAuth('/login');
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument();
  });

  it('muestra campo de contrasena', () => {
    renderAuth('/login');
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('muestra opciones de OAuth (Google y Facebook)', () => {
    renderAuth('/login');
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });
});
