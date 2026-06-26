import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { QueryBusProvider } from './app/queryBus';
import { ThemeProvider } from './app/theme';
import { I18nProvider } from './i18n/I18nProvider';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Élément #root introuvable.');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <QueryBusProvider>
          <App />
        </QueryBusProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);
