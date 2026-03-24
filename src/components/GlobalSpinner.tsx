import React from 'react';
import { useLoading } from '../context/LoadingContext';

const GlobalSpinner: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-[3px] animate-fade-in">
      <div className="relative">
        {/* Modern Spinner Design */}
        <div className="w-20 h-20 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 bg-blue-600 rounded-sm transform rotate-45"></div>
            </div>
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <p className="text-white font-black text-xs uppercase tracking-[0.2em] animate-pulse drop-shadow-md">
                Procesando
            </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default GlobalSpinner;
