import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("[CHECKPOINT 2] Radar Cultural App starting (main.tsx)...");
try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error("Fatal render error:", error);
  document.body.innerHTML = `<div style="color: white; padding: 20px; font-family: sans-serif;">
    <h1>Error al iniciar la app</h1>
    <pre>${error instanceof Error ? error.stack : String(error)}</pre>
  </div>`;
}
