import LuzDetrasLogo from './LuzDetrasLogo';

export const RespondeYaLogo = () => {
  return (
    <div className='relative mb-10 flex flex-col items-center justify-center pt-10'>
      {/* rayos de luz */}
      <div className='absolute inset-0 flex items-center justify-center z-0 my-30'>
        <LuzDetrasLogo />
      </div>

      <h1
        className='relative text-7xl md:text-9xl font-black text-center z-10'
        style={{
          color: '#ff7700',
          WebkitTextStroke: '6px #cc00ff',
          paintOrder: 'stroke fill',
          textShadow: `
            0 8px 20px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(255, 119, 0, 0.5)
          `,
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
        }}
      >
        ¡RespondeYa!
      </h1>
    </div>
  );
};
