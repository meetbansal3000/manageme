import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SettingsProvider } from './context/SettingsContext';
import { OwnerSecurityProvider } from './context/OwnerSecurityContext';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.log('PWA ServiceWorker Registration Failed:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <UserProvider>
          <AuthProvider>
            <SettingsProvider>
              <OwnerSecurityProvider>
                <App />
              </OwnerSecurityProvider>
            </SettingsProvider>
          </AuthProvider>
        </UserProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);

