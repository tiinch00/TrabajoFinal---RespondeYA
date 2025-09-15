import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className='bg-amber-500 w-full h-40 '>
      
     <div className="grid grid-cols-3">

       {/* Logo */}
      <div className='flex items-center justify-center'>
         <img
      src="/logo.png"
      alt="Logo"
      className="w-40 h-auto object-contain hover:scale-105 transition-transform"
      />
      </div>


    {/* Contacto */}
      <div className="flex items-center justify-center">
      <Link to="/contacto" className="text-white font-bold text-3xl hover:scale-110 transition-transform">Contactar</Link>
      </div>

    {/* Redes Sociales */}
    <div className= "flex items-center justify-around">
      <div className="w-auto bg-white rounded-full flex items-center justify-center">
        <a
          href="https://instagram.com/tiin.ch00"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="group bg-white p-1 size-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
        >
          <svg className="text-pink-600 fill-current group-hover:scale-110 transition-transform">
            <use xlinkHref="/sprite.svg#icon-instagram" />
          </svg>
        </a>
      </div>
      <div className="bg-white rounded-full flex items-center justify-center">
        <a
          href="https://www.facebook.com/tiin.cho.908"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="group bg-white p-1 size-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
        >
          <svg className="text-blue-600 fill-current  group-hover:scale-110 transition-transform">
            <use xlinkHref="/sprite.svg#icon-facebook" />
          </svg>
        </a>
      </div>
      <div className="bg-white rounded-full flex items-center justify-center">
         <a
          href="https://github.com/tiinch00"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="group bg-white p-1 size-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
        >
          <svg className="text-black fill-current group-hover:scale-110 transition-transform">
            <use xlinkHref="/sprite.svg#icon-github" />
          </svg>
        </a>
      </div>
      <div className=" bg-white rounded-full flex items-center justify-center">
         <a
          href="https://www.youtube.com/@tiinch00asdas11"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          className="group bg-white p-1 size-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
        >
          <svg className="text-red-600 fill-current group-hover:scale-110 transition-transform">
            <use xlinkHref="/sprite.svg#icon-youtube" />
          </svg>
        </a>
      </div>
    </div>
  </div>
      </footer>
  )
}
