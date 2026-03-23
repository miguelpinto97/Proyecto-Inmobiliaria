import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { ShieldCheck, Search, Zap, Building2, Key, Home as HomeIcon, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/real_estate_hero.png';

export default function Home() {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (res: CredentialResponse, role?: string) => {
    loginWithGoogle(res.credential || '', role)
      .then(() => {
        if (role === 'Vendedor') {
          navigate('/propiedades/nueva');
        } else {
          navigate('/propiedades');
        }
      })
      .catch(() => alert('Fallo inicio de sesión'));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[600px] lg:h-[700px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Real Estate Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="max-w-3xl space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold border border-blue-500/30 backdrop-blur-md">
              <Building2 className="w-4 h-4" />
              Tu aliado inmobiliario inteligente
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
              Encuentra, Publica y <br />
              <span className="text-blue-400">Gana con Flash</span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-xl leading-relaxed font-medium">
              La plataforma que conecta compradores y vendedores en tiempo real. Compra, vende o alquila con la rapidez y seguridad que mereces.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* CTA 1: Search */}
              <button 
                onClick={() => navigate('/propiedades')}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 group"
              >
                <Search className="w-6 h-6" />
                Explorar Propiedades
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* CTA 2: Publish (Logic for Login) */}
              {!user ? (
                <div className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                   <div className="relative p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                      <GoogleLogin
                        onSuccess={(res) => handleLoginSuccess(res, 'Vendedor')}
                        onError={() => alert('Fallo inicio de sesión')}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                        text="signup_with"
                        size="large"
                      />
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg">
                        Publicar como Vendedor
                      </div>
                   </div>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/propiedades/nueva')}
                  className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-lg backdrop-blur-md hover:bg-white/20 transition-all"
                >
                  Publicar Propiedad
                </button>
              )}
            </div>

            <div className="flex items-center gap-8 pt-8 opacity-70">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span className="text-sm font-bold uppercase tracking-widest">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Star className="w-6 h-6 text-amber-400" />
                <span className="text-sm font-bold uppercase tracking-widest">Servicio Premium</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Velocidad Flash</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Publica tu inmueble en minutos y empieza a recibir ofertas de inmediato gracias a nuestra tecnología de matching.
            </p>
          </div>

          <div className="space-y-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <HomeIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Catálogo Verificado</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Todas nuestras propiedades pasan por un proceso de revisión para garantizar la mejor experiencia para el comprador.
            </p>
          </div>

          <div className="space-y-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Key className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Directo al Dueño</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Olvídate de intermediarios innecesarios. Conecta directamente con el vendedor y cierra el trato en tus propios términos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
