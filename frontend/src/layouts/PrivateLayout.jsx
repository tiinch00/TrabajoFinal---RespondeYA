import { Footer } from '../components/Footer';
import HeaderPrivate from '../components/HeaderPrivate';
import { Outlet } from 'react-router-dom';
import FondoAnimado from './FondoAnimado';
import { RespondeYaLogo } from './RespondeYaLogo';
import { useLocation } from 'react-router-dom';

export default function PrivateLayout() {
  const location = useLocation();
  const mostrarLogo = location.pathname === '/comoJugar' ? false : true;
  return (
    <>
      <HeaderPrivate />
      <main className='relative w-full min-h-screen flex flex-col items-center bg-gray-900 justify-start pt-20'>
        {/* Fondo animado */}
        {mostrarLogo && <FondoAnimado />}

        {/* Contenido sobre el fondo */}
        <div className='z-10 w-full flex flex-col items-center justify-start'>
          {mostrarLogo && <RespondeYaLogo />}
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}
