import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Shield } from 'lucide-react';
import FormSection from './FormSection';

describe('FormSection', () => {
  it('renderiza el titulo correctamente', () => {
    render(<FormSection title="Mi seccion"><p>Contenido</p></FormSection>);
    expect(screen.getByText('Mi seccion')).toBeInTheDocument();
  });

  it('renderiza el icono cuando se proporciona', () => {
    const { container } = render(
      <FormSection title="Con icono" icon={Shield}><p>Contenido</p></FormSection>
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('no renderiza svg cuando no se proporciona icono', () => {
    const { container } = render(
      <FormSection title="Sin icono"><p>Contenido</p></FormSection>
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('aplica estilos de zona peligrosa cuando danger=true', () => {
    const { container } = render(
      <FormSection title="Zona peligrosa" danger><p>Contenido</p></FormSection>
    );
    expect(container.firstChild).toHaveClass('border-red-500/30');
    expect(container.firstChild).toHaveClass('bg-red-500/5');
  });

  it('aplica estilos normales por defecto', () => {
    const { container } = render(
      <FormSection title="Normal"><p>Contenido</p></FormSection>
    );
    expect(container.firstChild).toHaveClass('border-gray-800');
    expect(container.firstChild).toHaveClass('bg-gray-900');
  });

  it('renderiza los children', () => {
    render(
      <FormSection title="Test">
        <span data-testid="hijo">Contenido hijo</span>
      </FormSection>
    );
    expect(screen.getByTestId('hijo')).toBeInTheDocument();
    expect(screen.getByText('Contenido hijo')).toBeInTheDocument();
  });
});
