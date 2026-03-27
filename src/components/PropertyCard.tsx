import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Bath, Bed, ChevronRight, Trash2, Pencil, CheckCircle } from 'lucide-react';
import { useCommonValues } from '../hooks/useCommonValues';

interface PropertyProps {
  property: {
    id: number;
    operation_code: string;
    property_type_code: string;
    price: number;
    area: number;
    district_desc: string;
    address: string;
    locationtext?: string;
    rooms: number;
    bathrooms: number;
    mainimage?: string;
    status_code: string;
    status_desc: string;
    latitude?: number;
    longitude?: number;
    isaddresspublic?: boolean;
    reference?: string;
    features?: { id: number; descripcion: string; codigo: string }[];
  };
  showStatus?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onStatusChange?: (id: number, statusId: number) => void;
}

const PropertyCard: React.FC<PropertyProps> = ({ property, showStatus, onEdit, onDelete, onStatusChange }) => {
  const { values } = useCommonValues();

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full interactive-card group">
      <div className="relative h-56 overflow-hidden m-3 mb-0 rounded-[2rem]">
        <img
          src={property.mainimage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80'}
          alt={property.locationtext}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${property.operation_code === 'Venta' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
            {property.operation_code}
          </span>
          {property.property_type_code && (
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg bg-white text-slate-900">
              {property.property_type_code}
            </span>
          )}
          {showStatus && (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${property.status_code === 'Aprobada' ? 'bg-emerald-100 text-emerald-600' :
              property.status_code === 'Rechazada' ? 'bg-red-100 text-red-600' :
                'bg-amber-100 text-amber-600'
              }`}>
              {property.status_desc}
            </span>
          )}
        </div>
      </div>

      <div className="pt-6 px-6 pb-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-black text-slate-900 leading-none">
            S/ {Number(property.price).toLocaleString()}
          </h3>
        </div>

        <div className="flex items-start gap-2 mb-3 text-slate-500">
          <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-700 leading-tight">
              {property.district_desc}
            </span>
            <span className="text-xs font-medium text-slate-400 line-clamp-1">
              {property.isaddresspublic !== false
                ? `${property.address}${property.reference ? ` (${property.reference})` : ''}`
                : property.reference || 'Dirección Reservada'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-50 mb-1">
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

        {/* Features Preview */}
        {property.features && property.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {property.features.slice(0, 3).map(f => (
              <span key={f.id} className="text-[8px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                {f.descripcion}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="text-[8px] font-bold text-slate-400 px-1">+ {property.features.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <div className="grid grid-cols-5 gap-2">
            <Link
              to={`/propiedades/${property.id}`}
              className="col-span-4 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-2xl font-bold transition-all group/btn"
            >
              Ver Detalles
              <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
            <a
              href={property.latitude && property.longitude
                ? `https://www.google.com/maps?q=loc:${parseFloat(String(property.latitude))},${parseFloat(String(property.longitude))}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address}, ${property.district_desc}, Lima, Peru`)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all"
              title="Ver en Google Maps"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin size={20} />
            </a>
          </div>

          {(onEdit || onDelete || onStatusChange) && (
            <div className="flex gap-2 pt-3 border-t border-slate-50">
              {onEdit && (
                <button
                  onClick={() => onEdit(property.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Pencil size={14} />
                  Editar
                </button>
              )}
              {onStatusChange && (property.status_code === 'Aprobada' || property.status_code === 'Pendiente') && (
                <button
                  onClick={() => {
                    const statusCode = property.operation_code === 'Venta' ? 'Vendido' : 'Alquilado';
                    const statusVal = values?.EstadoPropiedad?.find((v: any) => v.codigo === statusCode);
                    if (statusVal) onStatusChange(property.id, statusVal.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <CheckCircle size={14} />
                  {property.operation_code === 'Venta' ? 'Vendido' : 'Alquilado'}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(property.id)}
                  className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  title="Eliminar Propiedad"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
