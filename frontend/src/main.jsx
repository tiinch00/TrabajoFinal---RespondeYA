import './index.css';

import App from './App.jsx';
import { AuthProvider } from './context/auth-context.jsx';
import { BrowserRouter } from 'react-router-dom';
import { GameProvider } from './context/ContextJuego.jsx';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </AuthProvider>
  </BrowserRouter>
);
