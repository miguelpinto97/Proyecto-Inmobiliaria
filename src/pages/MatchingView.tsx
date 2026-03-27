import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchingService } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { Target, Users, ArrowLeft, Mail, ExternalLink } from 'lucide-react';

const MatchingView: React.FC = () => {
  const { requirementId, propertyId } = useParams();
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        let res;
        if (requirementId) {
          res = await matchingService.getMatchesForRequirement(requirementId);
        } else if (propertyId) {
          res = await matchingService.getInterestedBuyers(propertyId);
        }
        setMatches(res?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, [requirementId, propertyId]);

  return (
    <div className="container py-12 flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 hover:bg-background rounded-full transition-colors"><ArrowLeft /></Link>
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          {requirementId ? <Target className="text-primary" /> : <Users className="text-accent" />}
          {requirementId ? 'Propiedades Recomendadas' : 'Compradores Interesados'}
        </h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando matches...</div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requirementId ? (
            matches.map((p: any) => (
              <div key={p.id} className="relative">
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black z-10 shadow-lg">
                  {Math.round(p.matchscore)}% Match
                </div>
                <PropertyCard property={p} />
              </div>
            ))
          ) : (
            matches.map((r: any) => (
              <div key={r.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all interactive-card">
                <div className="flex justify-between items-start mb-6">
                   <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                     <Users size={24} />
                   </div>
                   <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black">
                     {Math.round(r.matchscore)}% Interés
                   </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{r.firstname} {r.lastname}</h3>
                <p className="text-sm text-slate-500 mb-6 flex items-center gap-1 font-medium"><Mail size={14} /> {r.email}</p>
                
                <div className="flex flex-col gap-3 py-4 border-y border-slate-50 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Busca:</span>
                    <span className="font-bold text-slate-700">{r.property_type_desc} en {r.operation_desc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Presupuesto:</span>
                    <span className="font-bold text-slate-700">S/ {Number(r.maxprice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Distrito:</span>
                    <span className="font-bold text-slate-700">{r.district_desc}</span>
                  </div>
                </div>

                <a href={`mailto:${r.email}`} className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all group">
                   Contactar Comprador
                   <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-border text-text-muted text-lg">
          No se encontraron coincidencias en este momento. Sigue optimizando tu búsqueda.
        </div>
      )}
    </div>
  );
};

export default MatchingView;
