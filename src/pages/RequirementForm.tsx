import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { requirementService } from '../services/api';
import { useCommonValues } from '../hooks/useCommonValues';
import { Save, Loader2, Target, ChevronLeft, Ruler, Bed, Bath } from 'lucide-react';

const RequirementForm: React.FC = () => {
  const navigate = useNavigate();
  const { values, loading: valuesLoading } = useCommonValues();
  const [isSaving, setIsSaving] = React.useState(false);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      operationType: 'Venta',
      propertyType: 'Departamento',
      minPrice: '' as any,
      maxPrice: '' as any,
      minArea: '' as any,
      minRooms: 0,
      minBathrooms: 0,
      parkingRequired: false,
      elevatorRequired: false
    }
  });

  const propertyType = watch('propertyType');

  // Reset fields when propertyType is Terreno
  useEffect(() => {
    if (propertyType === 'Terreno') {
      setValue('minRooms', 0);
      setValue('minBathrooms', 0);
      setValue('elevatorRequired', false);
    }
  }, [propertyType, setValue]);

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      await requirementService.create(data);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert('Error guardando búsqueda');
    } finally {
      setIsSaving(false);
    }
  };

  if (valuesLoading) return <div className="flex justify-center items-center h-64 text-blue-500"><Loader2 className="animate-spin w-10 h-10" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-100 rounded-full transition-all interactive-icon">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Target className="text-blue-600" />
            Nueva Búsqueda
          </h1>
          <p className="text-slate-500 font-bold text-sm">Define lo que buscas y déjalo en manos de nuestro sistema de matching.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Card */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Operation Type Badges */}
            <div className="flex flex-col gap-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">¿Qué tipo de operación buscas?</label>
              <div className="flex flex-wrap gap-2">
                {values?.TipoOperacion?.map((v: any) => {
                  const isSelected = watch('operationType') === v.codigo;
                  return (
                    <button
                      key={v.codigo}
                      type="button"
                      onClick={() => setValue('operationType', v.codigo)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2 interactive-card ${isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'
                        }`}
                    >
                      {v.descripcion}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Property Type Badges */}
            <div className="flex flex-col gap-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tipo de Inmueble</label>
              <div className="flex flex-wrap gap-2">
                {values?.TipoInmueble?.map((v: any) => {
                  const isSelected = watch('propertyType') === v.codigo;
                  return (
                    <button
                      key={v.codigo}
                      type="button"
                      onClick={() => setValue('propertyType', v.codigo)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2 interactive-card ${isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
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
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Presupuesto (S/)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Mín.</span>
                  <input
                    type="number"
                    {...register('minPrice')}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 text-sm transition-all"
                    placeholder="0"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Máx.</span>
                  <input
                    type="number"
                    {...register('maxPrice')}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 text-sm transition-all"
                    placeholder="Sin límite"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Área Mínima (m²)</label>
              <div className="relative">
                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  {...register('minArea')}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-700 text-sm transition-all"
                  placeholder="Ej: 60"
                />
              </div>
            </div>
          </div>

          {propertyType !== 'Terreno' && (
            <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Habitaciones (Mín.)</label>
                <div className="relative">
                  <Bed size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="number" min="0" {...register('minRooms')} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 font-bold text-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Baños (Mín.)</label>
                <div className="relative">
                  <Bath size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="number" min="0" {...register('minBathrooms')} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 font-bold text-sm" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="flex items-center gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white hover:border-blue-200 transition-all group">
              <div className="relative inline-flex items-center">
                <input type="checkbox" {...register('parkingRequired')} className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <span className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">¿Cochera obligatoria?</span>
            </label>

            {propertyType !== 'Terreno' && (
              <label className="flex items-center gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white hover:border-blue-200 transition-all group">
                <div className="relative inline-flex items-center">
                  <input type="checkbox" {...register('elevatorRequired')} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
                <span className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors">¿Ascensor obligatorio?</span>
              </label>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all interactive-icon"
            >
              Descartar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary px-12 py-4 min-w-[260px] shadow-xl shadow-blue-500/20 text-sm font-black uppercase tracking-widest gap-3"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Guardar Preferencias
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RequirementForm;
