import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { propertyService } from '../services/api';
import { MapPin, Maximize, Bath, Bed, Info, CheckCircle2 } from 'lucide-react';

const PropertyDetail: React.FC = () => {
  const { id } = useParams();
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

  if (isLoading) return <div className="h-screen flex items-center justify-center">Cargando...</div>;
  if (!property) return <div className="container py-24 text-center text-3xl font-bold">Propiedad no encontrada</div>;

  return (
    <div className="container py-12 flex flex-col gap-12">
      {/* Header & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-3xl overflow-hidden shadow-lg h-[500px] border-4 border-white">
            <img src={mainImage || 'https://via.placeholder.com/800x500'} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {property.images?.map((img: any, idx: number) => (
              <img 
                key={idx} 
                src={img.imageurl} 
                className={`w-24 h-24 object-cover rounded-xl cursor-pointer border-2 transition-all ${mainImage === img.imageurl ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`} 
                onClick={() => setMainImage(img.imageurl)}
              />
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="flex flex-col gap-8">
           <div className="glass p-8 rounded-3xl shadow-xl flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${property.operationtype === 'Venta' ? 'bg-primary text-white' : 'bg-accent text-white'}`}>
                  {property.operationtype}
                </span>
                <span className="text-sm text-text-muted">Publicado hace 2 días</span>
              </div>
              
              <h1 className="text-4xl font-extrabold text-text-main">${Number(property.price).toLocaleString()}</h1>
              
              <div className="flex items-center gap-2 text-text-muted">
                <MapPin className="text-primary shrink-0" size={20} />
                <span className="font-medium">{property.locationtext}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-border py-6 my-2">
                <div className="flex flex-col items-center gap-1">
                  <Maximize size={24} className="text-secondary" />
                  <span className="text-sm font-bold">{property.area} m²</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Bed size={24} className="text-secondary" />
                  <span className="text-sm font-bold">{property.rooms}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Bath size={24} className="text-secondary" />
                  <span className="text-sm font-bold">{property.bathrooms}</span>
                </div>
              </div>

              <button className="btn btn-primary py-4 w-full text-lg">Contactar Vendedor</button>
              <button className="btn btn-outline py-4 w-full">Agendar Visita</button>
           </div>

           {/* Features area placeholder */}
           <div className="bg-surface p-8 rounded-3xl border border-border flex flex-col gap-4">
              <h3 className="font-bold text-xl flex items-center gap-2"><Info size={20} /> Características</h3>
              <ul className="grid grid-cols-1 gap-3">
                <li className="flex items-center gap-2 text-text-muted"><CheckCircle2 size={18} className="text-success" /> {property.parkingspots} Estacionamiento(s)</li>
                <li className="flex items-center gap-2 text-text-muted"><CheckCircle2 size={18} className="text-success" /> Piso: {property.floornumber}</li>
                {property.haselevator && <li className="flex items-center gap-2 text-text-muted"><CheckCircle2 size={18} className="text-success" /> Cuenta con Ascensor</li>}
              </ul>
           </div>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-4xl flex flex-col gap-6">
        <h2 className="text-3xl font-extrabold">Descripción</h2>
        <p className="text-lg text-text-muted leading-relaxed whitespace-pre-wrap">
          {property.description || 'Sin descripción disponible.'}
        </p>
      </div>
    </div>
  );
};

export default PropertyDetail;
