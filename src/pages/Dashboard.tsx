import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, TrendingUp, Building, Search, Users, Target, User as UserIcon, Settings, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { propertyService, requirementService } from '../services/api';
import PropertyCard from '../components/PropertyCard';

const Dashboard: React.FC = () => {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propsRes, reqsRes] = await Promise.all([
          propertyService.getMyProperties(),
          requirementService.getMyRequirements(),
        ]);
        setProperties(propsRes.data);
        setRequirements(reqsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePublishClick = () => {
    if (!isProfileComplete()) {
      setShowProfileModal(true);
    } else {
      navigate('/propiedades/nueva');
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">¡Hola, {user?.firstname}! 👋</h1>
          <p className="text-slate-500 mt-1">Aquí tienes el resumen de tu actividad inmobiliaria.</p>
        </div>
        <button
          onClick={handlePublishClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          Publicar Propiedad
        </button>
      </div>

      {/* User Stats/Profile Hint */}
      {!isProfileComplete() && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-center justify-between animate-fade-in group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Settings size={24} />
            </div>
            <div>
              <h4 className="font-black text-amber-900 leading-tight">Perfil Incompleto</h4>
              <p className="text-amber-700 text-sm font-medium">Completa tus datos para poder publicar anuncios.</p>
            </div>
          </div>
          <Link to="/perfil" className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all">
            Completar Ahora
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-blue-500"><Loader2 className="w-10 h-10 animate-spin" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center space-x-4 text-blue-600 mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl"><Building className="w-6 h-6" /></div>
                <span className="font-bold text-lg">Mis Listados</span>
              </div>
              <p className="text-4xl font-black text-slate-900">{properties.length}</p>
              <p className="text-sm text-slate-500 mt-2 font-medium">Propiedades publicadas por ti.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center space-x-4 text-emerald-600 mb-4">
                <div className="p-3 bg-emerald-50 rounded-2xl"><Search className="w-6 h-6" /></div>
                <span className="font-bold text-lg">Mis Búsquedas</span>
              </div>
              <p className="text-4xl font-black text-slate-900">{requirements.length}</p>
              <p className="text-sm text-slate-500 mt-2 font-medium">Requerimientos activos de compra/alquiler.</p>
            </div>

            <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-500/20 flex flex-col justify-center relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center space-x-3 text-white/90 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="font-bold">Potenciales Matches</span>
                </div>
                <p className="text-4xl font-black">Pronto</p>
                <p className="text-sm text-white/70 mt-2">Algoritmo de IA calculando...</p>
              </div>
              <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Properties Section */}
            <div className="bg-slate-50/50 rounded-3xl border border-slate-200/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Mis Publicaciones
                </h2>
                <button className="text-blue-600 text-sm font-bold hover:underline">Ver todas</button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {properties.map(p => (
                  <div key={p.id}>
                    <PropertyCard property={p} showStatus={true} />
                  </div>
                ))}
                {properties.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 font-medium">
                    No has publicado ninguna propiedad aún.
                  </div>
                )}
              </div>
            </div>

            {/* Requirements Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  ¿Qué estás buscando?
                </h2>
                <button
                  onClick={() => navigate('/busquedas/nueva')}
                  className="text-emerald-600 text-sm font-bold hover:underline"
                >
                  Nuevo Requerimiento
                </button>
              </div>

              <div className="space-y-4">
                {requirements.map(r => (
                  <div key={r.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => navigate(`/matching/${r.id}`)}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        {r.propertytype} en {r.operationtype}
                      </h4>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.location}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500 font-medium italic">
                      <span>Max. S/ {r.maxprice?.toLocaleString()}</span>
                      <span>Min. {r.minarea} m²</span>
                    </div>
                    <button className="w-full mt-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                      Calcular Matching IA
                    </button>
                  </div>
                ))}
                {requirements.length === 0 && (
                  <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl font-medium">No tienes requerimientos activos.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Profile Check Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl space-y-6 animate-scale-in">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mx-auto">
              <UserIcon size={42} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900">¡Casi listo!</h3>
              <p className="text-slate-500 font-medium">Para publicar una propiedad, primero necesitamos que completes tu información de contacto en tu perfil.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/perfil')}
                className="w-full btn btn-primary py-4 text-lg"
              >
                Completar Perfil
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
              >
                Tal vez después
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
