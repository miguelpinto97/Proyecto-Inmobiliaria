import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { propertyService, cloudinaryService } from '../services/api';
import { useCommonValues } from '../hooks/useCommonValues';
import { useAuth } from '../context/AuthContext';
import { Upload, X, Loader2, Save, Image as ImageIcon, ChevronLeft, MapPin } from 'lucide-react';

const PropertyForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isProfileComplete } = useAuth();
  const { values, loading: valuesLoading } = useCommonValues();
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, reset, watch } = useForm();
  watch('operationType');

  useEffect(() => {
    if (!isProfileComplete()) {
      alert('Debes completar tu perfil antes de publicar.');
      navigate('/perfil');
      return;
    }

    if (id) {
      const fetchProperty = async () => {
        try {
          const res = await propertyService.getById(id);
          const p = res.data;
          reset({
            operationType: p.operationtype,
            price: p.price,
            area: p.area,
            district: p.district,
            address: p.address,
            rooms: p.rooms,
            bathrooms: p.bathrooms,
            parkingSpots: p.parkingspots,
            floorNumber: p.floornumber,
            hasElevator: p.haselevator,
            description: p.description
          });
          setImages(p.images?.map((img: any) => img.imageurl) || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchProperty();
    }
  }, [id, reset, isProfileComplete, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const sigRes = await cloudinaryService.getSignature();
      const newImages = [...images];
      
      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= 10) break;
        const url = await cloudinaryService.uploadImage(files[i], sigRes.data);
        newImages.push(url);
      }
      setImages(newImages);
    } catch (err) {
      console.error(err);
      alert('Error subiendo imágenes');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    if (images.length === 0) return alert('Debes subir al menos una imagen');
    
    setIsSaving(true);
    try {
      const payload = { ...data, images };
      if (id) {
        await propertyService.update(id, payload);
      } else {
        await propertyService.create(payload);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Error guardando propiedad');
    } finally {
      setIsSaving(false);
    }
  };

  if (valuesLoading) return <div className="flex justify-center items-center h-64 text-blue-500"><Loader2 className="animate-spin w-10 h-10" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {id ? 'Editar Propiedad' : 'Publicar Propiedad'}
          </h1>
          <p className="text-slate-500 font-medium">Completa los detalles para atraer a los mejores compradores.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Tipo de Operación</label>
              <select 
                {...register('operationType', { required: true })} 
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
              >
                {values?.TipoOperacion?.map((v: any) => (
                  <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Precio (S/)</label>
              <input 
                type="number" step="0.01" 
                {...register('price', { required: true })} 
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all" 
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Área Total (m²)</label>
              <input 
                type="number" step="0.1" 
                {...register('area', { required: true })} 
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all" 
                placeholder="0.0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Distrito</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  {...register('district', { required: true })} 
                  className="w-full pl-12 pr-10 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecciona un distrito</option>
                  {values?.Distrito?.map((v: any) => (
                    <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Dirección o Referencia</label>
              <input 
                type="text" 
                {...register('address', { required: true })} 
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all" 
                placeholder="Ej: Av. Larco 123, frente al parque" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Habitaciones</label>
              <input type="number" {...register('rooms')} className="p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Baños</label>
              <input type="number" {...register('bathrooms')} className="p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cocheras</label>
              <input type="number" {...register('parkingSpots')} className="p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Piso</label>
              <input type="number" {...register('floorNumber')} className="p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold" />
            </div>
          </div>

          <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('hasElevator')} id="elevator" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <label htmlFor="elevator" className="font-bold text-slate-700 cursor-pointer">¿Cuenta con ascensor?</label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black uppercase tracking-widest text-slate-400">Descripción Detallada</label>
            <textarea 
              {...register('description')} 
              rows={4} 
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700 transition-all resize-none" 
              placeholder="Describe lo mejor de tu propiedad..."
            ></textarea>
          </div>
        </div>

        {/* Image Upload Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="text-blue-500" />
                Galería de Fotos
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Sube hasta 10 imágenes (máx. 2MB cada una).</p>
            </div>
            <label className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-100 transition-colors ${images.length >= 10 || isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={18} />
              Seleccionar
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={images.length >= 10 || isUploading} />
            </label>
          </div>

          {isUploading && (
            <div className="flex items-center justify-center gap-3 p-8 bg-blue-50 rounded-2xl text-blue-600 font-bold animate-pulse">
              <Loader2 className="animate-spin" /> 
              Procesando imágenes...
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square border border-slate-100 shadow-sm">
                <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                <button 
                  type="button" 
                  onClick={() => removeImage(idx)} 
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X size={14} />
                </button>
                {idx === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">
                    Portada
                  </div>
                )}
              </div>
            ))}
            {images.length === 0 && !isUploading && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                <ImageIcon size={48} className="mb-2 opacity-20" />
                <p className="font-bold">No hay imágenes seleccionadas</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 py-6">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')} 
            className="px-10 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSaving || isUploading} 
            className="btn btn-primary px-12 py-4 text-lg min-w-[240px]"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} className="mr-2" />}
            {id ? 'Guardar Cambios' : 'Publicar Ahora'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
