import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ComoJugar = () => {
  const { t } = useTranslation();

  return (
    <div className='w-full h-full bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 pt-15'>
      <div className='relative z-20 text-center px-6 '>
        <h1 className='text-6xl md:text-7xl font-bold mb-6 text-white'>
          {t('howToPlay_welcome')}{' '}
          <span
            className='text-transparent bg-clip-text'
            style={{
              color: '#ff7500',
              WebkitTextStroke: '6px #cc00ff',
              paintOrder: 'stroke fill',
              textShadow: `
            0 8px 20px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(255, 119, 0, 0.5)
          `,
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
            }}
          >
            RespondeYa!
          </span>
        </h1>
        <p className='text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto'>
          {t('howToPlay_description')}
        </p>
        <Link
          to='/login'
          className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg inline-block'
        >
          {t('howToPlay_start')}
        </Link>
      </div>

      <section className='relative py-24 px-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='order-2 md:order-1'>
              <div className='inline-block bg-purple-600/20 px-4 py-2 rounded-full mb-4'>
                <span className='text-purple-300 font-semibold'>{t('howToPlay_fundamentals')}</span>
              </div>
              <h2 className='text-5xl font-bold mb-6 text-white'>
                {t('howToPlay_howToPlayTitle')}
              </h2>
              <p className='text-xl text-gray-300 leading-relaxed'>
                {t('howToPlay_howToPlayText_1')}
                <span className='text-purple-400 font-semibold'>
                  {' '}
                  {t('howToPlay_howToPlayText_2')}
                </span>{' '}
                o
                <span className='text-pink-400 font-semibold'>
                  {' '}
                  {t('howToPlay_howToPlayText_3')}
                </span>
                {t('howToPlay_howToPlayText_4')}
              </p>
            </div>

            <div className='order-1 md:order-2'>
              <div className='relative w-full h-96'>
                <div className='absolute top-0 left-0 w-72 h-80 z-10'>
                  <div className='bg-gradient-to-br from-purple-600 to-pink-600 p-1 rounded-2xl shadow-2xl h-full'>
                    <div className='bg-gray-900 rounded-xl p-6 h-full flex items-center justify-center'>
                      <img
                        src='./assets/comoJugar/jugar.png'
                        alt='jugar individual o multijugador'
                        className='w-full h-full object-contain'
                      />
                    </div>
                  </div>
                </div>

                <div className='absolute bottom-0 right-0 w-72 h-80 z-20'>
                  <div className='bg-gradient-to-br from-pink-600 to-purple-600 p-1 rounded-2xl shadow-2xl h-full'>
                    <div className='bg-gray-900 rounded-xl p-6 h-full flex items-center justify-center'>
                      <img
                        src='./assets/comoJugar/opciones.png'
                        alt='Opciones de categoria y dificultad'
                        className='w-full h-full object-contain'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='relative py-24 px-6 bg-black/30'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
                <div className='bg-gradient-to-br from-blue-600 to-purple-600 p-1'>
                  <div className='bg-gray-900 rounded-xl p-12'>
                    <div className='text-6xl mb-4 text-center'>👥</div>
                    <p className='text-white text-center text-lg'>
                      {t('howToPlay_friendsImagePlaceholder')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className='inline-block bg-blue-600/20 px-4 py-2 rounded-full mb-4'>
                <span className='text-blue-300 font-semibold'>{t('howToPlay_social')}</span>
              </div>
              <h2 className='text-5xl font-bold mb-6 text-white'>
                {t('howToPlay_addFriendsTitle')}
              </h2>
              <p className='text-xl text-gray-300 leading-relaxed'>
                {t('howToPlay_addFriendsText_1')}{' '}
                <span className='text-blue-400 font-semibold'>
                  {t('howToPlay_addFriendsText_2')}
                </span>{' '}
                {t('howToPlay_addFriendsText_3')}{' '}
                <span className='text-purple-400 font-semibold'>
                  {t('howToPlay_addFriendsText_4')}
                </span>
                {t('howToPlay_addFriendsText_5')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='relative py-24 px-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='order-2 md:order-1'>
              <div className='inline-block bg-green-600/20 px-4 py-2 rounded-full mb-4'>
                <span className='text-green-300 font-semibold'>{t('howToPlay_communication')}</span>
              </div>
              <h2 className='text-5xl font-bold mb-6 text-white'>{t('howToPlay_liveChatTitle')}</h2>
              <p className='text-xl text-gray-300 leading-relaxed'>
                {t('howToPlay_liveChatText_1')}{' '}
                <span className='text-green-400 font-semibold text-center'>
                  {t('howToPlay_liveChatText_2')}
                </span>{' '}
                {t('howToPlay_liveChatText_3')}
              </p>
            </div>
            <div className='order-1 md:order-2'>
              <div className='relative w-full h-96'>
                <div className='absolute bottom-20 right-80 w-65 h-60 z-10'>
                  <div className='bg-gradient-to-br from-purple-600 to-pink-600 p-1 rounded-2xl shadow-2xl h-full'>
                    <div className='bg-gray-900 rounded-xl p-6 h-full flex items-center justify-center'>
                      <img
                        src='./assets/comoJugar/logoChat.png'
                        alt='Logo del chat global'
                        className='w-full h-full object-contain'
                      />
                    </div>
                  </div>
                </div>

                <div className='absolute bottom-0 right-5 w-85 h-100 z-20'>
                  <div className='bg-gradient-to-br from-pink-600 to-purple-600 p-1 rounded-2xl shadow-2xl h-full'>
                    <div className='bg-gray-900 rounded-xl p-6 h-full flex items-center justify-center'>
                      <img
                        src='./assets/comoJugar/chat.png'
                        alt='Opciones'
                        className='w-full h-full object-contain'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='relative py-24 px-6 bg-black/30'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
                <div className='bg-gradient-to-br from-yellow-600 to-orange-600 p-1'>
                  <div className='bg-gray-900 rounded-xl p-12'>
                    <img src='./assets/comoJugar/tienda.png' />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className='inline-block bg-yellow-600/20 px-4 py-2 rounded-full mb-4'>
                <span className='text-yellow-300 font-semibold'>
                  {t('howToPlay_customization')}
                </span>
              </div>
              <h2 className='text-5xl font-bold mb-6 text-white'>{t('howToPlay_buySkinsTitle')}</h2>
              <p className='text-xl text-gray-300 leading-relaxed'>
                {t('howToPlay_buySkinsText_1')}{' '}
                <span className='text-yellow-400 font-semibold'>
                  {t('howToPlay_buySkinsText_2')}
                </span>{' '}
                {t('howToPlay_buySkinsText_3')}{' '}
                <span className='text-orange-400 font-semibold'>
                  {t('howToPlay_buySkinsText_4')}
                </span>
                {t('howToPlay_buySkinsText_5')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='relative py-24 px-6 text-center'>
        <div className='max-w-3xl mx-auto'>
          <h2 className='text-4xl md:text-5xl font-bold mb-6 text-white'>
            {t('howToPlay_readyTitle')}
          </h2>
          <p className='text-xl text-gray-300 mb-8'>{t('howToPlay_readyText')}</p>
          <Link
            to='/login'
            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg inline-block'
          >
            {t('howToPlay_playNow')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ComoJugar;
