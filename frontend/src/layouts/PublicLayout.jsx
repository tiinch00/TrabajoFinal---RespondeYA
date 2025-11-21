import FondoAnimado from './FondoAnimado';
import { Footer } from '../components/Footer';
import HeaderPublic from '../components/HeaderPublic';
import { Outlet } from 'react-router-dom';
import { RespondeYaLogo } from './RespondeYaLogo';
import { useLocation } from 'react-router-dom';

export default function PublicLayout() {
  const location = useLocation();
  const mostrarLogo = location.pathname === '/comoJugar' ? false : true;

  return (
    <div className='flex flex-col min-h-screen bg-gray-900'>
      <HeaderPublic />

      <main className='relative w-full flex-1 flex flex-col items-center justify-start overflow-x-hidden'>
        {mostrarLogo && <FondoAnimado />}

        <div className='relative z-10 w-full flex flex-col items-center justify-start px-4 sm:px-6 md:px-8 pb-6'>
          {mostrarLogo && <RespondeYaLogo />}
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
