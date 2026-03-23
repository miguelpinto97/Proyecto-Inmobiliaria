import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { ShieldCheck, Search, Zap, Users, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      
      {/* Hero Section */}
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-16 text-slate-200 py-12">
        
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold border border-blue-500/20 shadow-inner">
             <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
             Modelo Flash v3.0
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
             Encuentra tu lugar <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Sin Complicaciones</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
             La plataforma inmobiliaria más rápida y amigable. Publica en segundos, recibe ofertas en tiempo real y encuentra el match perfecto para tu próxima inversión.
          </p>
          
          <div className="flex flex-col items-center lg:items-start gap-4 pt-4">
             {/* Google Login Wrapper */}
             <div className="p-2.5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl inline-block transition-transform hover:scale-105 duration-300">
                <GoogleLogin
                  onSuccess={(res: CredentialResponse) => loginWithGoogle(res.credential || '')}
                  onError={() => alert('Fallo inicio de sesión')}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="continue_with"
                />
             </div>
             <div className="flex items-center gap-6 mt-4 opacity-60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs uppercase tracking-widest font-bold">Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="text-xs uppercase tracking-widest font-bold">Premium</span>
                </div>
             </div>
          </div>
        </div>
        
        {/* Right side Visual */}
        <div className="flex-1 w-full max-w-2xl relative">
           <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 rounded-3xl blur-3xl opacity-30"></div>
           <div className="bg-slate-800 rounded-3xl border border-slate-700/50 p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
              
              <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
                       <Zap className="w-7 h-7" />
                    </div>
                    <div>
                       <h3 className="text-white font-bold text-xl mb-1">Carga Flash</h3>
                       <p className="text-slate-400 text-sm leading-snug">Publica tus inmuebles en menos de 2 minutos con nuestro asistente inteligente.</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                       <Search className="w-7 h-7" />
                    </div>
                    <div>
                       <h3 className="text-white font-bold text-xl mb-1">Smart Search</h3>
                       <p className="text-slate-400 text-sm leading-snug">Filtros inteligentes que aprenden de tus preferencias para mostrarte lo mejor.</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10">
                       <Users className="w-7 h-7" />
                    </div>
                    <div>
                       <h3 className="text-white font-bold text-xl mb-1">Matching Directo</h3>
                       <p className="text-slate-400 text-sm leading-snug">Conecta al instante con compradores interesados que cumplen tus criterios.</p>
                    </div>
                 </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-700/50 flex items-center justify-between text-slate-400">
                <div className="text-center">
                  <p className="text-white font-bold text-2xl">500+</p>
                  <p className="text-xs uppercase tracking-tighter">Propiedades</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-2xl">98%</p>
                  <p className="text-xs uppercase tracking-tighter">Satisfacción</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-2xl">24/7</p>
                  <p className="text-xs uppercase tracking-tighter">Soporte</p>
                </div>
              </div>
           </div>
        </div>
        
      </div>
      
    </div>
  );
}
