import { Link } from 'react-router-dom';

export default function HeaderPublic() {
  return (
    <header className='bg-black text-white px-6 py-3 shadow sticky top-0 w-full'>
      <nav className='flex items-center justify-between'>
        <Link to='/' className='h-14 flex items-center group'>
          <div className='text-4xl font-black tracking-tight'>
            <span className='bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 text-transparent bg-clip-text hover:from-purple-300 hover:via-pink-300 hover:to-purple-400 transition-all duration-300'>
              Dev
              <span className='text-cyan-400 hover:text-cyan-300 transition-colors duration-300'>
                2
              </span>
              Play
            </span>
          </div>
        </Link>
        <ul className='flex items-center gap-6 text-lg'>
          <li>
            <Link to='/login' className='hover:underline'>
              Ingresar
            </Link>
          </li>
          <li>
            <Link to='/register' className='hover:underline'>
              Registrarse
            </Link>
          </li>
          <li>
            <Link to='/comoJugar' className='hover:underline'>
              Cómo Jugar
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
