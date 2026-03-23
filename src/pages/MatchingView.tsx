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
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                  {Math.round(p.matchscore)}% Match
                </div>
                <PropertyCard property={p} />
              </div>
            ))
          ) : (
            matches.map((r: any) => (
              <div key={r.id} className="bg-white border border-border p-8 rounded-3xl shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-6">
                   <div className="bg-accent/10 text-accent p-3 rounded-2xl">
                     <Users size={24} />
                   </div>
                   <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                     {Math.round(r.matchscore)}% Interés
                   </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{r.firstname} {r.lastname}</h3>
                <p className="text-sm text-text-muted mb-6 flex items-center gap-1"><Mail size={14} /> {r.email}</p>
                
                <div className="flex flex-col gap-3 py-4 border-y border-border mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="font-bold">Busca:</span>
                    <span>{r.operationtype}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Presupuesto:</span>
                    <span>${Number(r.minprice).toLocaleString()} - ${Number(r.maxprice).toLocaleString()}</span>
                  </div>
                </div>

                <a href={`mailto:${r.email}`} className="btn btn-primary w-full gap-2">
                   Contactar Comprador
                   <ExternalLink size={16} />
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
