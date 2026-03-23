import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService, cloudinaryService } from '../services/api';
import {
  Upload, X, MapPin, Building2, Ruler, Bed, Bath,
  Car, Loader2, Save, Image as ImageIcon, ChevronLeft,
  Lock, Unlock, Globe, Check
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
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLockedToMap, setIsLockedToMap] = useState(false);
  const [tempMapData, setTempMapData] = useState<any>(null);
  const [manualNumber, setManualNumber] = useState('');

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
          if (p.latitude && p.longitude) setIsLockedToMap(true);
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
            {/* Map Modal Trigger */}
            <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                  <Globe size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Ubicar en el Mapa</h3>
                  <p className="text-sm text-slate-500 font-bold">Usa el mapa para autocompletar la dirección y el distrito.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-100 rounded-2xl font-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm flex items-center gap-3 active:scale-95"
              >
                <MapPin size={18} />
                Abrir Mapa Interactivo
              </button>
            </div>
            <div className="flex flex-col gap-3">
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
                    className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase hover:text-blue-700 transition-colors"
                  >
                    <Lock size={12} />
                    Bloqueado al Mapa
                  </button>
                )}
                {!isLockedToMap && watch('latitude') === null && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase">
                    <Unlock size={12} />
                    Manual
                  </span>
                )}
              </div>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  {...register('district', { required: true })}
                  disabled={isLockedToMap}
                  className={`w-full pl-12 pr-10 py-5 rounded-2xl border ${isLockedToMap ? 'border-blue-100 bg-blue-50/30' : 'border-slate-200 bg-slate-50'} outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all appearance-none cursor-pointer ${isLockedToMap ? 'cursor-not-allowed opacity-70' : ''}`}
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
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className={`text-[10px] font-bold uppercase transition-colors ${watch('isAddressPublic') ? 'text-blue-600' : 'text-slate-400'}`}>
                      {watch('isAddressPublic') ? 'Pública' : 'Reservada'}
                    </span>
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" {...register('isAddressPublic')} className="sr-only peer" />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                  </label>
                </div>
              </div>
              <input
                type="text"
                {...register('address', { required: watch('isAddressPublic') })}
                readOnly={isLockedToMap}
                className={`p-5 rounded-2xl border ${isLockedToMap ? 'border-blue-100 bg-blue-50/30' : 'border-slate-200 bg-slate-50'} outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 transition-all ${isLockedToMap ? 'cursor-not-allowed opacity-70' : ''}`}
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

      {/* Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-md" onClick={() => setIsMapModalOpen(false)} />
          
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
                      setValue('district', tempMapData.districtCode);
                    }
                    setIsLockedToMap(true);
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
