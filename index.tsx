
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const init = () => {
  const container = document.getElementById('root');
  if (container) {
    // Limpa o conteúdo do container (remove o loader) antes de montar o React
    const root = createRoot(container);
    root.render(<App />);
  }
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
