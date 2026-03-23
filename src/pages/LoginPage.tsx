import React from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building, ShieldCheck, Star } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <Building size={40} className="text-blue-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Modelo Flash</h1>
          <p className="text-slate-500 font-medium">Gestiona tus activos con inteligencia.</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          
          <div className="text-center space-y-4">
             <h2 className="text-2xl font-bold text-slate-800">Inicia Sesión</h2>
             <p className="text-sm text-slate-500 leading-relaxed font-medium">
               Usa tu cuenta de Google para acceder a tu panel de control y gestionar tus propiedades de forma instantánea.
             </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 py-4">
            <div className="p-1 px-1.5 bg-slate-50 rounded-full border border-slate-100 transition-all hover:scale-105 active:scale-95 duration-300">
              <GoogleLogin
                onSuccess={(res: CredentialResponse) => loginWithGoogle(res.credential || '')}
                onError={() => alert('Fallo inicio de sesión')}
                theme="outline"
                shape="pill"
                size="large"
                text="continue_with"
                width="310"
              />
            </div>
            
            <div className="flex items-center justify-center gap-6 text-slate-400">
              <div className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Seguro</span>
              </div>
              <div className="flex items-center gap-1 border-x border-slate-100 px-4">
                <Star size={14} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Premium</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">v3.0</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed uppercase tracking-tighter">
              Al continuar, aceptas nuestros <b>Términos de Servicio</b> y <b>Políticas de Privacidad</b> aplicables a la plataforma.
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center px-8">
           <p className="text-slate-400 text-xs font-medium">
             ¿Necesitas ayuda? <a href="#" className="underline font-bold text-slate-600 hover:text-blue-600">Contactar Soporte</a>
           </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
