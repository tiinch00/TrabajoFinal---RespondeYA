import FondoAnimado from './FondoAnimado';
import { Footer } from '../components/Footer';
import HeaderPrivate from '../components/HeaderPrivate';
import { Outlet } from 'react-router-dom';
import { RespondeYaLogo } from './RespondeYaLogo';
import { useLocation } from 'react-router-dom';

export default function PrivateLayout() {
  const location = useLocation();
  const mostrarLogo = location.pathname === '/comoJugar' ? false : true;

  return (
    // LayoutPrivate.jsx (o como se llame)
    <div className='flex flex-col min-h-screen bg-gray-900'>
      <HeaderPrivate />

      <main className='relative w-full flex-1 flex flex-col items-center justify-start overflow-x-hidden'>
        {/* Fondo animado SIEMPRE por detrás */}
        {mostrarLogo && (
          <div className='pointer-events-none absolute inset-0 z-0'>
            <FondoAnimado />
          </div>
        )}

        {/* Contenido principal por encima del fondo */}
        <div className='relative z-10 w-full flex flex-col items-center justify-start mt-12 px-4 lg:px-6 xl:px-8 pb-6'>
          {mostrarLogo && <RespondeYaLogo />}
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
