import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService, cloudinaryService } from '../services/api';
import {
  Upload, X, MapPin, Building2, Ruler, Bed, Bath,
  Car, Loader2, Save, Image as ImageIcon, ChevronLeft
} from 'lucide-react';
import { useCommonValues } from '../hooks/useCommonValues';
import { useAuth } from '../context/AuthContext';
import MapPicker from '../components/MapPicker';

const PropertyForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isProfileComplete } = useAuth();
  const { values, loading: valuesLoading } = useCommonValues();
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      operationType: 'Venta',
      propertyType: '',
      price: '',
      area: '',
      district: '',
      address: '',
      rooms: 0,
      bathrooms: 0,
      parkingSpots: 0,
      floorNumber: 0,
      hasElevator: false,
      description: '',
      latitude: null as number | null,
      longitude: null as number | null,
      isAddressPublic: true,
      reference: ''
    }
  });

  const propertyCoords = {
    lat: watch('latitude'),
    lng: watch('longitude')
  };

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
            propertyType: p.propertytype,
            price: p.price,
            area: p.area,
            district: p.district,
            address: p.address,
            rooms: p.rooms,
            bathrooms: p.bathrooms,
            parkingSpots: p.parkingspots,
            floorNumber: p.floornumber,
            hasElevator: p.haselevator,
            description: p.description,
            latitude: p.latitude,
            longitude: p.longitude,
            isAddressPublic: p.isaddresspublic !== undefined ? p.isaddresspublic : true,
            reference: p.reference || ''
          });
          if (p.latitude && p.longitude) setShowMapPicker(true);
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

  if (valuesLoading) return <div className="flex justify-center items-center h-screen text-blue-500"><Loader2 className="animate-spin w-12 h-12" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 animate-fade-in pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white hover:bg-slate-50 rounded-full shadow-sm transition-all border border-slate-100">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {id ? 'Editar Propiedad' : 'Publicar Propiedad'}
          </h1>
          <p className="text-slate-500 font-bold">Completa los detalles para atraer a los mejores compradores.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        {/* Basic Info Card */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Tipo de Operación</label>
              <select
                {...register('operationType', { required: true })}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
              >
                {values?.TipoOperacion?.map((v: any) => (
                  <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Tipo de Inmueble</label>
              <select
                {...register('propertyType', { required: true })}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
              >
                <option value="">Selecciona tipo</option>
                {values?.TipoInmueble?.map((v: any) => (
                  <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Precio (S/)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                <input
                  type="number" step="0.01"
                  {...register('price', { required: true })}
                  className="w-full pl-12 pr-5 py-5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Área Total (m²)</label>
              <div className="relative">
                <Ruler className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number" step="0.1"
                  {...register('area', { required: true })}
                  className="w-full pl-12 pr-5 py-5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Distrito</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  {...register('district', { required: true })}
                  className="w-full pl-12 pr-10 py-5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecciona un distrito</option>
                  {values?.Distrito?.map((v: any) => (
                    <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Dirección Exacta</label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <span className={`text-[10px] font-bold uppercase transition-colors ${watch('isAddressPublic') ? 'text-blue-600' : 'text-slate-400'}`}>
                    {watch('isAddressPublic') ? 'Publicada' : 'Reservada'}
                  </span>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" {...register('isAddressPublic')} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              </div>
              <input
                type="text"
                {...register('address', { required: watch('isAddressPublic') })}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all"
                placeholder="Ej: Av. Larco 123"
              />
              {!watch('isAddressPublic') && (
                <p className="text-[10px] text-blue-600 font-bold italic">* La dirección exacta solo será visible para el administrador.</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Referencia / Ubicación Pública</label>
              <input
                type="text"
                {...register('reference', { required: !watch('isAddressPublic') })}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all"
                placeholder="Ej: Frente al parque, a dos cuadras del óvalo"
              />
              {!watch('isAddressPublic') && (
                <p className="text-[10px] text-emerald-600 font-bold italic">* Este texto será visible para todos los usuarios.</p>
              )}
            </div>

            <div className="flex flex-col gap-3 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Ubicación Precisa (Opcional)</label>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${showMapPicker ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  <MapPin size={14} />
                  {showMapPicker ? 'Ocultar Mapa' : 'Ubicar en el Mapa'}
                </button>
              </div>

              {showMapPicker && (
                <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner group animate-in fade-in slide-in-from-top-4 duration-300">
                  <MapPicker
                    value={propertyCoords.lat && propertyCoords.lng ? { lat: propertyCoords.lat, lng: propertyCoords.lng } : undefined}
                    onChange={(data) => {
                      setValue('latitude', data.lat);
                      setValue('longitude', data.lng);
                      
                      if (!data.isGeocoding && data.address) {
                        setValue('address', data.address);
                      }
                      
                      if (!data.isGeocoding && data.district) {
                        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                        const searchDist = normalize(data.district);
                        
                        const districtCode = values?.Distrito?.find((d: any) => {
                          const desc = normalize(d.descripcion);
                          return searchDist.includes(desc) || desc.includes(searchDist);
                        })?.codigo;
                        
                        if (districtCode) {
                          setValue('district', districtCode);
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Habitaciones</label>
              <div className="relative">
                <Bed size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="number" {...register('rooms')} className="w-full pl-10 pr-3 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Baños</label>
              <div className="relative">
                <Bath size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="number" {...register('bathrooms')} className="w-full pl-10 pr-3 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cocheras</label>
              <div className="relative">
                <Car size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="number" {...register('parkingSpots')} className="w-full pl-10 pr-3 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Piso</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="number" {...register('floorNumber')} className="w-full pl-10 pr-3 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('hasElevator')} id="elevator" className="sr-only peer" />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
            <label htmlFor="elevator" className="font-bold text-slate-700 cursor-pointer">¿Cuenta con ascensor?</label>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-black uppercase tracking-widest text-slate-400">Descripción Detallada</label>
            <textarea
              {...register('description')}
              rows={5}
              className="p-5 rounded-[2rem] border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-700 transition-all resize-none"
              placeholder="Describe lo mejor de tu propiedad..."
            ></textarea>
          </div>
        </div>

        {/* Image Upload Card */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
          <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <ImageIcon className="text-blue-500" />
                Galería de Fotos
              </h2>
              <p className="text-sm text-slate-500 font-bold mt-1">Sube hasta 10 imágenes (máx. 2MB cada una).</p>
            </div>
            <label className={`cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 border border-blue-100 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-sm ${images.length >= 10 || isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={20} />
              Cargar Fotos
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={images.length >= 10 || isUploading} />
            </label>
          </div>

          {isUploading && (
            <div className="flex items-center justify-center gap-3 p-10 bg-blue-50 rounded-3xl text-blue-600 font-black animate-pulse border-2 border-dashed border-blue-200">
              <Loader2 className="animate-spin w-8 h-8" />
              Procesando imágenes...
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            {images.map((img, idx) => (
              <div key={idx} className="relative group rounded-[2rem] overflow-hidden aspect-square border-4 border-white shadow-md hover:shadow-xl transition-all">
                <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X size={16} />
                </button>
                {idx === 0 && (
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    Portada
                  </div>
                )}
              </div>
            ))}
            {images.length === 0 && !isUploading && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-50 rounded-[3rem] bg-slate-50/30">
                <ImageIcon size={64} className="mb-4 opacity-10" />
                <p className="font-black text-lg text-slate-400">No hay imágenes seleccionadas</p>
                <p className="text-sm font-bold text-slate-300">Las fotos ayudan a vender más rápido.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-6 py-12">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-12 py-5 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="px-16 py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 min-w-[300px]"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={24} className="text-blue-400" />}
            {id ? 'Guardar Cambios' : 'Publicar Ahora'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
