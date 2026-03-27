import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService, cloudinaryService } from '../services/api';
import {
  Upload, X, MapPin, Building2, Ruler, Bed, Bath,
  Car, Loader2, Save, Image as ImageIcon, ChevronLeft,
  Lock, Unlock, Check, Star, ChevronRight, Map, Type
} from 'lucide-react';
import { useCommonValues } from '../hooks/useCommonValues';
import { useAuth } from '../context/AuthContext';
import MapPicker from '../components/MapPicker';

interface ImageItem {
  file?: File;
  url: string;
  isNew: boolean;
}

const PropertyForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isProfileComplete } = useAuth();
  const { values, loading: valuesLoading } = useCommonValues();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLockedToMap, setIsLockedToMap] = useState(false);
  const [locationMethod, setLocationMethod] = useState<'map' | 'manual' | null>(null);
  const [tempMapData, setTempMapData] = useState<any>(null);
  const [manualNumber, setManualNumber] = useState('');

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      operationTypeId: 0,
      propertyTypeId: 0,
      price: '',
      area: '',
      districtId: 0,
      address: '',
      rooms: 0,
      bathrooms: 0,
      parkingSpots: 0,
      floorNumber: 0,
      description: '',
      latitude: null as number | null,
      longitude: null as number | null,
      isAddressPublic: true,
      reference: '',
      featureIds: [] as number[]
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
            operationTypeId: p.operationtypeid,
            propertyTypeId: p.propertytypeid,
            price: p.price,
            area: p.area,
            districtId: p.districtid,
            address: p.address,
            rooms: p.rooms,
            bathrooms: p.bathrooms,
            parkingSpots: p.parkingspots,
            floorNumber: p.floornumber,
            description: p.description,
            latitude: p.latitude,
            longitude: p.longitude,
            isAddressPublic: p.isaddresspublic !== undefined ? p.isaddresspublic : true,
            reference: p.reference || '',
            featureIds: p.features?.map((f: any) => f.id) || []
          });
          if (p.latitude && p.longitude) {
            setIsLockedToMap(true);
            setLocationMethod('map');
          } else if (p.address) {
            setLocationMethod('manual');
            setIsLockedToMap(false);
          }
          setImages(p.images?.map((img: any) => ({
            url: img.imageurl,
            isNew: false
          })) || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchProperty();
    }
  }, [id, reset, isProfileComplete, navigate]);

  const propertyTypeId = watch('propertyTypeId');
  const propertyType = values?.TipoInmueble?.find((v: any) => v.id === Number(propertyTypeId))?.codigo;

  useEffect(() => {
    if (propertyType === 'Terreno') {
      setValue('rooms', 0);
      setValue('bathrooms', 0);
      setValue('parkingSpots', 0);
      setValue('floorNumber', 0);
    }
  }, [propertyType, setValue]);

  const handleManualEntry = () => {
    setLocationMethod('manual');
    setIsLockedToMap(false);
    setValue('latitude', null);
    setValue('longitude', null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      if (images.length + newItems.length >= 10) break;
      const file = files[i];
      const url = URL.createObjectURL(file);
      newItems.push({ file, url, isNew: true });
    }
    setImages([...images, ...newItems]);
  };

  const removeImage = (index: number) => {
    const img = images[index];
    if (img.isNew) {
      URL.revokeObjectURL(img.url);
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [coverImg] = newImages.splice(index, 1);
    newImages.unshift(coverImg);
    setImages(newImages);
  };

  const onSubmit = async (data: any) => {
    if (images.length === 0) return alert('Debes subir al menos una imagen');

    setIsSaving(true);
    setIsUploading(true);
    try {
      // 1. Upload new images to Cloudinary
      const sigRes = await cloudinaryService.getSignature();
      const finalImageUrls: string[] = [];

      for (const img of images) {
        if (img.isNew && img.file) {
          const uploadedUrl = await cloudinaryService.uploadImage(img.file, sigRes.data);
          finalImageUrls.push(uploadedUrl);
        } else {
          finalImageUrls.push(img.url);
        }
      }

      // 2. Send to backend
      const payload = { 
        ...data, 
        operationTypeId: Number(data.operationTypeId),
        propertyTypeId: Number(data.propertyTypeId),
        districtId: Number(data.districtId),
        featureIds: (data.featureIds || []).map(Number),
        images: finalImageUrls 
      };

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
      setIsUploading(false);
    }
  };

  if (valuesLoading) return <div className="flex justify-center items-center h-screen text-blue-500"><Loader2 className="animate-spin w-12 h-12" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-8 animate-fade-in pb-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white hover:bg-slate-50 rounded-full shadow-sm transition-all border border-slate-100">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {id ? 'Editar Propiedad' : 'Publicar Propiedad'}
          </h1>
          <p className="text-slate-500 font-bold text-sm">Completa los detalles para atraer a los mejores compradores.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Tipo de Operación</label>
              <div className="flex flex-wrap gap-2">
                {values?.TipoOperacion?.map((v: any) => {
                  const isSelected = watch('operationTypeId') === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setValue('operationTypeId', v.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'
                        }`}
                    >
                      {v.descripcion}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Tipo de Inmueble</label>
              <div className="flex flex-wrap gap-2">
                {values?.TipoInmueble?.map((v: any) => {
                  const isSelected = watch('propertyTypeId') === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setValue('propertyTypeId', v.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'
                        }`}
                    >
                      {v.descripcion}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Precio (S/)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">S/</span>
                <input
                  type="number" step="0.01" min="0"
                  {...register('price', { required: true, min: 0 })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black uppercase tracking-widest text-slate-400">Área Total (m²)</label>
              <div className="relative">
                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="number" step="0.1" min="0"
                  {...register('area', { required: true, min: 0 })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all text-sm"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
            <label className="text-sm font-black uppercase tracking-widest text-slate-400">¿Cómo prefieres ingresar la ubicación?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 interactive-card ${locationMethod === 'map' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'}`}
              >
                <div className={`p-3 rounded-xl ${locationMethod === 'map' ? 'bg-blue-500' : 'bg-blue-50 text-blue-600'}`}>
                  <Map size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-wide">Seleccionar en Mapa</p>
                  <p className={`text-[10px] font-bold ${locationMethod === 'map' ? 'text-blue-100' : 'text-slate-400'}`}>Precisión GPS para tu propiedad</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleManualEntry}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 interactive-card ${locationMethod === 'manual' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'}`}
              >
                <div className={`p-3 rounded-xl ${locationMethod === 'manual' ? 'bg-blue-500' : 'bg-blue-50 text-blue-600'}`}>
                  <Type size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-wide">Ingreso Manual</p>
                  <p className={`text-[10px] font-bold ${locationMethod === 'manual' ? 'text-blue-100' : 'text-slate-400'}`}>Escribir dirección manualmente</p>
                </div>
              </button>
            </div>
          </div>

          {locationMethod && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-400">Distrito</label>
                  {isLockedToMap && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("¿Quieres desbloquear los campos? Se perderá la ubicación exacta del mapa.")) {
                          setIsLockedToMap(false);
                          setValue('latitude', null);
                          setValue('longitude', null);
                        }
                      }}
                      className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase hover:text-blue-700 transition-colors"
                    >
                      <Lock size={10} />
                      Bloqueado
                    </button>
                  )}
                  {!isLockedToMap && watch('latitude') === null && (
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase">
                      <Unlock size={10} />
                      Manual
                    </span>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    {...register('districtId', { required: true })}
                    disabled={isLockedToMap}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border ${isLockedToMap ? 'border-blue-100 bg-blue-50/30' : 'border-slate-200 bg-slate-50'} outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer text-sm ${isLockedToMap ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    <option value="">Selecciona un distrito</option>
                    {values?.Distrito?.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.descripcion}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-400">Dirección Exacta</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <span className={`text-[9px] font-bold uppercase transition-colors ${watch('isAddressPublic') ? 'text-blue-600' : 'text-slate-400'}`}>
                        {watch('isAddressPublic') ? 'Pública' : 'Reservada'}
                      </span>
                      <div className="relative inline-flex items-center">
                        <input type="checkbox" {...register('isAddressPublic')} className="sr-only peer" />
                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  {...register('address', { required: watch('isAddressPublic') })}
                  readOnly={isLockedToMap}
                  className={`p-3 rounded-xl border ${isLockedToMap ? 'border-blue-100 bg-blue-50/30' : 'border-slate-200 bg-slate-50'} outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all text-sm ${isLockedToMap ? 'cursor-not-allowed opacity-70' : ''}`}
                  placeholder="Ej: Av. Larco 123"
                />
                {!watch('isAddressPublic') && (
                  <p className="text-[10px] text-blue-600 font-bold italic">* La dirección exacta solo será visible para el administrador.</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Referencia / Ubicación Pública</label>
                <input
                  type="text"
                  {...register('reference', { required: !watch('isAddressPublic') })}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all text-sm"
                  placeholder="Ej: Frente al parque, a dos cuadras del óvalo"
                />
                {!watch('isAddressPublic') && (
                  <p className="text-[10px] text-emerald-600 font-bold italic">* Este texto será visible para todos los usuarios.</p>
                )}
              </div>
            </div>
          )}

          {propertyType !== 'Terreno' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 md:p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Habitaciones</label>
                  <div className="relative">
                    <Bed size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="number" min="0" {...register('rooms', { min: 0 })} className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold text-sm" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Baños</label>
                  <div className="relative">
                    <Bath size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="number" min="0" {...register('bathrooms', { min: 0 })} className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold text-sm" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cocheras</label>
                  <div className="relative">
                    <Car size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="number" min="0" {...register('parkingSpots', { min: 0 })} className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold text-sm" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Piso</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="number" min="0" {...register('floorNumber', { min: 0 })} className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-center font-bold text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-black uppercase tracking-widest text-slate-400">Características Adicionales</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {values?.Caracteristica?.map((v: any) => {
                    const featureIds = watch('featureIds') || [];
                    const isSelected = featureIds.includes(v.id);
                    return (
                      <label
                        key={v.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'
                        }`}
                      >
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...featureIds, v.id]
                                : featureIds.filter((fid: number) => fid !== v.id);
                              setValue('featureIds', newIds);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                        <span className="font-bold text-xs">{v.descripcion}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black uppercase tracking-widest text-slate-400">Descripción Detallada</label>
            <textarea
              {...register('description')}
              rows={4}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-700 transition-all resize-none text-sm"
              placeholder="Describe lo mejor de tu propiedad..."
            ></textarea>
          </div>
        </div>

        {/* Image Upload Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 md:p-6 rounded-3xl border border-slate-100 gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <ImageIcon className="text-blue-500" size={20} />
                Galería de Fotos
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1">Sube hasta 10 imágenes (máx. 2MB).</p>
            </div>
            <label className={`cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 border border-blue-50 rounded-xl font-black text-xs hover:bg-blue-50 transition-all shadow-sm ${images.length >= 10 || isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={16} />
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
              <div key={idx} className={`relative group rounded-[1.5rem] overflow-hidden aspect-square border-4 ${idx === 0 ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-white shadow-md'} hover:shadow-xl transition-all`}>
                <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                
                {/* Delete Button (Always Visible on Hover) */}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all interactive-icon shadow-lg backdrop-blur-sm hover:bg-red-600"
                >
                  <X size={14} />
                </button>

                {/* Cover Indicator (Always Visible) */}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg border border-blue-400">
                    Portada
                  </div>
                )}

                {/* Selection Overlay (Controls) */}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-1.5">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => setAsCover(idx)}
                      className="p-1.5 bg-white/20 hover:bg-blue-500 text-white rounded-lg transition-all interactive-icon border border-white/30"
                      title="Poner como portada"
                    >
                      <Star size={14} className={idx === 0 ? 'fill-current' : ''} />
                    </button>
                  )}
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, -1)}
                      className="p-1.5 bg-white/20 hover:bg-slate-800 text-white rounded-lg transition-all interactive-icon border border-white/30"
                      title="Mover atrás"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, 1)}
                      className="p-1.5 bg-white/20 hover:bg-slate-800 text-white rounded-lg transition-all interactive-icon border border-white/30"
                      title="Mover adelante"
                    >
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
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

        <div className="flex justify-end gap-4 py-8">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 rounded-xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="px-10 py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-black hover:shadow-2xl hover:shadow-slate-300 hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 min-w-[200px] active:scale-95"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="text-blue-400" />}
            {id ? 'Guardar Cambios' : 'Publicar Ahora'}
          </button>
        </div>
      </form>

      {/* Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-md cursor-pointer" onClick={() => setIsMapModalOpen(false)} />

          <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">
            {/* Ultra-Compact Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} className="text-blue-600" />
                Ubicar Propiedad
              </h3>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative bg-slate-50">
              <MapPicker
                value={propertyCoords.lat && propertyCoords.lng ? { lat: propertyCoords.lat, lng: propertyCoords.lng } : undefined}
                onChange={(data) => {
                  if (!data.isGeocoding) {
                    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                    const searchDist = data.district ? normalize(data.district) : '';

                    const matches = values?.Distrito?.filter((d: any) => {
                      const desc = normalize(d.descripcion);
                      return searchDist && (searchDist.includes(desc) || desc.includes(searchDist));
                    }) || [];

                    const districtMatch = matches.sort((a: any, b: any) => b.descripcion.length - a.descripcion.length)[0];

                    setTempMapData({
                      ...data,
                      districtCode: districtMatch?.codigo,
                      districtName: districtMatch?.descripcion
                    });
                  } else {
                    setTempMapData({ isGeocoding: true });
                  }
                }}
              />
            </div>

            <div className="px-5 py-3 bg-white border-t border-slate-100 shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full">
                  {tempMapData?.isGeocoding ? (
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase">
                      <Loader2 size={12} className="animate-spin" />
                      Procesando...
                    </div>
                  ) : tempMapData?.address ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-blue-600 font-black text-[9px] uppercase tracking-widest">
                        <Check size={12} />
                        Ubicación Detectada
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-black text-slate-700 truncate">
                          {tempMapData.address}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="text"
                            value={manualNumber}
                            onChange={(e) => setManualNumber(e.target.value)}
                            className="w-24 bg-white border-2 border-blue-100 rounded-lg px-3 py-1.5 text-xs font-black text-blue-600 outline-none focus:border-blue-500 transition-all placeholder:text-blue-200"
                            placeholder="Nro / Int"
                          />
                          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-500 font-bold text-[10px] flex items-center">
                            {tempMapData.districtName || '??'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 font-bold italic text-[10px]">Mueve el PIN para detectar ubicación</p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!tempMapData?.address || tempMapData?.isGeocoding}
                  onClick={() => {
                    setValue('latitude', tempMapData.lat);
                    setValue('longitude', tempMapData.lng);
                    const finalAddress = manualNumber.trim()
                      ? `${tempMapData.address} ${manualNumber.trim()}`
                      : tempMapData.address;
                    setValue('address', finalAddress);
                    if (tempMapData.districtCode) {
                      const districtMatch = values?.Distrito?.find((d: any) => d.codigo === tempMapData.districtCode);
                      if (districtMatch) {
                        setValue('districtId', districtMatch.id);
                      }
                    }
                    setIsLockedToMap(true);
                    setLocationMethod('map'); // Set method to map on confirmation
                    setIsMapModalOpen(false);
                    setManualNumber(''); // Reset for next time
                  }}
                  className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2 shrink-0 ${tempMapData?.address && !tempMapData?.isGeocoding ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}`}
                >
                  <Check size={14} />
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyForm;
