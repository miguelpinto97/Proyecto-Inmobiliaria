import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Bath, Bed, ChevronRight } from 'lucide-react';
import { useCommonValues } from '../hooks/useCommonValues';

interface PropertyProps {
  property: {
    id: number;
    operationtype: string;
    price: number;
    area: number;
    locationtext: string;
    rooms: number;
    bathrooms: number;
    mainimage?: string;
    status: string;
  };
  showStatus?: boolean;
}

const PropertyCard: React.FC<PropertyProps> = ({ property, showStatus }) => {
  const { values } = useCommonValues();

  const getStatusLabel = (code: string) => {
    return values?.EstadoPropiedad?.find((v: any) => v.codigo === code)?.descripcion || code;
  };
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden flex flex-col h-full">
      <div className="relative h-56 overflow-hidden m-3 rounded-[2rem]">
        <img 
          src={property.mainimage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80'} 
          alt={property.locationtext}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${property.operationtype === 'Venta' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
            {property.operationtype}
          </span>
          {showStatus && (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
              property.status === 'Aprobada' ? 'bg-emerald-100 text-emerald-600' : 
              property.status === 'Rechazada' ? 'bg-red-100 text-red-600' : 
              'bg-amber-100 text-amber-600'
            }`}>
              {getStatusLabel(property.status)}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-black text-slate-900 leading-none">
            S/ {Number(property.price).toLocaleString()}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-6 text-slate-500">
          <MapPin size={16} className="text-blue-500 shrink-0" />
          <span className="text-sm font-bold line-clamp-1">{property.locationtext}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-50 mb-6">
          <div className="flex flex-col items-center gap-1">
            <Bed size={18} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{property.rooms} hab.</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-slate-50">
            <Bath size={18} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{property.bathrooms} baños</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Maximize size={18} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{property.area} m²</span>
          </div>
        </div>
        
        <Link 
          to={`/propiedades/${property.id}`} 
          className="mt-auto flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-2xl font-bold transition-all group/btn"
        >
          Ver Detalles
          <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
