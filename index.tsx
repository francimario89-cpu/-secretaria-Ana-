
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const bootstrap = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Elemento 'root' não encontrado no DOM.");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("App iniciado com sucesso.");
  } catch (error) {
    console.error("Erro ao montar o React App:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; text-align: center;">
        <h3>Erro de Inicialização</h3>
        <p>Verifique o console para mais detalhes.</p>
      </div>
    `;
  }
};

// Aguarda o DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
