import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useNavigationGuard(message, when = true) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!when) return;

    const handler = (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      if (link.target === '_blank') return;

      const href = link.getAttribute('href');
      if (!href) return;

      const confirmExit = window.confirm(message);

      if (!confirmExit) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        // limpiar historial
        window.history.replaceState(null, '', href);
      }
    };

    document.addEventListener('click', handler, true);

    return () => {
      document.removeEventListener('click', handler, true);
    };
  }, [message, when]);

  // ⚠ interceptar navigate() programático
  useEffect(() => {
    if (!when) return;

    const originalNavigate = navigate;

    navigate.blocked = true;

    navigate.confirmedNavigate = originalNavigate;

    navigate.navigateWithGuard = (to) => {
      const proceed = window.confirm(message);
      if (proceed) originalNavigate(to);
    };

    return () => {
      navigate.blocked = false;
    };
  }, [navigate, when, message]);

  return {
    guardedNavigate: navigate.navigateWithGuard,
  };
}
