import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t, i18n } = useTranslation();
  return (
    <footer className='bg-gradient-to-b from-black/90 to-black w-full py-6 xl:py-8 mt-auto border-t border-purple-500/30'>
      
      <div className='max-w-7xl mx-auto sm:px-0 lg:px-2 xl:px-4 '>
        
        <div className='grid grid-cols-1 md:grid-cols-3 lg:gap--6 xl:gap-6 items-center'>
          
          {/* logo repondeya */}
          <div className='flex justify-center items-center'>
            <Link
              to='/'
              className='flex items-center group'
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >              
              <div className='text-xl lg:text-3xl xl:text-5xl font-black tracking-tight'>
                <span className='bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 text-transparent bg-clip-text hover:from-purple-300 hover:via-pink-300 hover:to-purple-400 transition-all duration-300'>
                  Dev
                  <span className='text-cyan-400 hover:text-cyan-300 transition-colors duration-300'>
                    2
                  </span>
                  Play
                </span>
              </div>
            </Link>
          </div>

          {/* contactarse */}
          <div className='flex justify-center items-center'>
            <Link
              to='/contacto'
              className='text-white font-semibold text-base md:text-md lg:text-lg xl:text-2xl tracking-wide hover:text-purple-400 hover:scale-105 transition-all duration-300'
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {t('contactUs')}
            </Link>
          </div>

          {/* logos */}
          <div className='flex items-center justify-center md:justify-end gap-3 sm:gap-4 md:gap-6 flex-wrap'>
            {/* ig */}
            <a
              href='https://instagram.com/tiin.ch00'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Instagram'
              className='bg-white w-8 lg:w-10 xl:w-15 h-8 lg:h-10 xl:h-15 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300'
            >
              <svg className='w-6 lg:w-7 xl:w-10 h-6 lg:h-7 xl:h-10 text-pink-600 fill-current'>
                <use xlinkHref='/sprite.svg#icon-instagram' />
              </svg>
            </a>

            {/* facebook */}
            <a
              href='https://www.facebook.com/tiin.cho.908'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Facebook'
              className='bg-white w-8 h-8 lg:w-10 lg:h-10 xl:w-15 xl:h-15 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300'
            >
              <svg className='w-6 lg:w-7 xl:w-10 h-6 lg:h-7 xl:h-10 text-blue-600 fill-current'>
                <use xlinkHref='/sprite.svg#icon-facebook' />
              </svg>
            </a>
            
            {/* github */}
            <a
              href='https://github.com/tiinch00'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub'
              className='bg-white w-8 h-8 lg:w-10 lg:h-10 xl:w-15 xl:h-15 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300'
            >
              <svg className='w-6 lg:w-7 xl:w-10 h-6 lg:h-7 xl:h-10 text-black fill-current'>
                <use xlinkHref='/sprite.svg#icon-github' />
              </svg>
            </a>

            {/* youtube */}
            <a
              href='https://www.youtube.com/@tiinch00asdas11'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='YouTube'
              className='bg-white w-8 h-8 lg:w-10 lg:h-10 xl:w-15 xl:h-15 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300'
            >
              <svg className='w-6 lg:w-7 cl:w-10 h-6 lg:h-7 xl:h-10 text-red-600 fill-current'>
                <use xlinkHref='/sprite.svg#icon-youtube' />
              </svg>
            </a>
          </div>
        </div>

        <div className='text-center mt-6 xl:mt-8 pt-4 xl:pt-6 border-t border-purple-500/20'>
          <p className='text-gray-400 text-xs xl:text-sm'>
            © {new Date().getFullYear()} Dev2Play - {t('allRights')}
          </p>
        </div>
      </div>
    </footer>
  );
};
