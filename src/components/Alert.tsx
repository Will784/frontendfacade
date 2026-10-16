import type { ReactNode } from 'react';

interface AlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  children: ReactNode;
  onClose?: () => void;
}

export function Alert({ type, children, onClose }: AlertProps) {
  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <div className="alert__content">{children}</div>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Cerrar mensaje">
          ×
        </button>
      )}
    </div>
  );
}
