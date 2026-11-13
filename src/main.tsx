import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { invoke } from '@tauri-apps/api/core';

// Signal to Rust backend that main.tsx has mounted and is alive
try {
  invoke('update_pill_hit_rect', {
    rect: { x: 255.0, y: 0.0, width: 210.0, height: 38.0 },
  }).catch(() => {});
} catch {}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
