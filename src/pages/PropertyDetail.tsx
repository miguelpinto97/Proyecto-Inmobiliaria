import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/api';
import { MapPin, Maximize, Bath, Bed, Info, CheckCircle2, Phone, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const PropertyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await propertyService.getById(id!);
        setProperty(res.data);
        if (res.data.images?.length > 0) setMainImage(res.data.images[0].imageurl);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (isLoading) return <div className="h-screen flex items-center justify-center text-blue-500 font-bold">Cargando...</div>;
  if (!property) return <div className="container py-24 text-center text-3xl font-bold">Propiedad no encontrada</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-12 animate-fade-in">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/propiedades')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black transition-all w-fit group interactive-icon"
      >
        <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
          <ChevronLeft size={20} />
        </div>
        Volver al Catálogo
      </button>

      {/* Header & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-[3rem] overflow-hidden shadow-2xl h-[500px] border-4 border-white relative group">
            <img src={mainImage || 'https://via.placeholder.com/800x500'} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {property.images?.map((img: any, idx: number) => (
              <img 
                key={idx} 
                src={img.imageurl} 
                className={`w-28 h-28 object-cover rounded-3xl cursor-pointer border-4 transition-all shrink-0 hover:scale-105 active:scale-95 ${mainImage === img.imageurl ? 'border-blue-600 shadow-lg' : 'border-white opacity-70 hover:opacity-100 shadow-sm'}`} 
                onClick={() => setMainImage(img.imageurl)}
              />
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="flex flex-col gap-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 flex flex-col gap-8">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${property.operation_code === 'Venta' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
                  {property.operation_desc}
                </span>
                {property.property_type_desc && (
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 shadow-sm">
                    {property.property_type_desc}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Hace 2 días</span>
            </div>
            
            <h1 className="text-5xl font-black text-slate-900 leading-none tracking-tight">
              S/ {Number(property.price).toLocaleString()}
            </h1>
            
            <div className="flex items-center justify-between gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3">
                <MapPin className="text-blue-500 shrink-0" size={20} />
                <span className="font-bold text-slate-600 text-sm leading-tight">
                  {property.district_desc}
                  {property.isaddresspublic !== false 
                    ? `, ${property.address}${property.reference ? ` (${property.reference})` : ''}` 
                    : ` - ${property.reference || 'Dirección Reservada'}`}
                </span>
              </div>
              <a 
                href={property.latitude && property.longitude 
                  ? `https://www.google.com/maps?q=loc:${parseFloat(String(property.latitude))},${parseFloat(String(property.longitude))}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address}, ${property.district_desc}, Lima, Peru`)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-3 rounded-2xl text-blue-600 shadow-sm hover:shadow-md transition-all group/map interactive-icon"
                title="Abrir en Google Maps"
              >
                <MapPin size={20} className="group-hover/map:scale-110 transition-transform" />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 border-y border-slate-50 py-8">
              <div className="flex flex-col items-center gap-1.5">
                <Maximize size={24} className="text-slate-300" />
                <span className="text-sm font-black text-slate-900">{property.area} m²</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 border-x border-slate-50">
                <Bed size={24} className="text-slate-300" />
                <span className="text-sm font-black text-slate-900">{property.rooms}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Bath size={24} className="text-slate-300" />
                <span className="text-sm font-black text-slate-900">{property.bathrooms}</span>
              </div>
            </div>

            {user ? (
              <button 
                onClick={() => alert('¡Mensaje enviado al vendedor! En breve se contactarán contigo.')}
                className="bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/20 active:scale-95 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
              >
                <Phone size={22} />
                Contactar Vendedor
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 text-center uppercase tracking-wider">Inicia sesión para contactar</p>
                </div>
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={(res) => loginWithGoogle(res.credential || '')}
                    onError={() => alert('Fallo inicio de sesión')}
                    theme="filled_blue"
                    shape="pill"
                    size="large"
                    text="continue_with"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-4">
             <h3 className="font-black text-xl flex items-center gap-2 tracking-tight">
               <Info size={20} className="text-blue-400" /> 
               Características
             </h3>
             <ul className="space-y-3">
                {property.parkingspots > 0 && (
                  <li className="flex items-center gap-3 text-slate-300 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-blue-400" /> 
                    {property.parkingspots} Estacionamiento(s)
                  </li>
                )}
               <li className="flex items-center gap-3 text-slate-300 font-bold text-sm">
                 <CheckCircle2 size={18} className="text-blue-400" /> 
                 Piso: {property.floornumber}
               </li>
               {property.features?.map((f: any) => (
                 <li key={f.featureid} className="flex items-center gap-3 text-slate-300 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-blue-400" /> 
                    {f.descripcion}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-4xl space-y-6">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Descripción</h2>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm">
          <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
            {property.description || 'Sin descripción disponible.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
