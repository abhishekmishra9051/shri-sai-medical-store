import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { StoreConfigProvider } from './context/StoreConfigContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StoreConfigProvider>
    <App />
  </StoreConfigProvider>
);
