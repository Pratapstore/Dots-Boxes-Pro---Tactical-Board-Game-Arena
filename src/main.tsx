import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Dots & Boxes Pro:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/40 p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl shadow-lg">
              ⚠️
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Dots & Boxes Pro</h2>
              <p className="text-xs text-slate-400 mt-1">
                A temporary error occurred while rendering the game interface.
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('dots_boxes_pro_settings');
                window.location.reload();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Restart Game Arena
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);

