import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { nextbox } from '@shared/integrations/nextbox';

import App from './App.tsx';
import './index.css';

nextbox.app.init((state) => {
  nextbox.api.changeState(state);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
