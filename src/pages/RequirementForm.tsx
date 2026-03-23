import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { requirementService } from '../services/api';
import { useCommonValues } from '../hooks/useCommonValues';
import { Save, Loader2, Target, ChevronLeft } from 'lucide-react';

const RequirementForm: React.FC = () => {
  const navigate = useNavigate();
  const { values, loading: valuesLoading } = useCommonValues();
  const [isSaving, setIsSaving] = React.useState(false);
  
  const { register, handleSubmit } = useForm();

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
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Target className="text-blue-600" />
            Nueva Búsqueda
          </h1>
          <p className="text-slate-500 font-medium">Define lo que buscas y deja que nuestra IA haga el trabajo pesado.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">¿Qué buscas?</label>
              <select 
                {...register('operationType', { required: true })} 
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 appearance-none cursor-pointer"
              >
                {values?.TipoOperacion?.map((v: any) => (
                  <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Área Mínima (m²)</label>
              <input 
                type="number" 
                {...register('minArea')} 
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700" 
                placeholder="Ej: 60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Presupuesto Mín. (S/)</label>
              <input 
                type="number" 
                {...register('minPrice')} 
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700" 
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Presupuesto Máx. (S/)</label>
              <input 
                type="number" 
                {...register('maxPrice')} 
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700" 
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Habitaciones (Min.)</label>
              <input type="number" {...register('minRooms')} className="p-4 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 font-bold text-center" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Baños (Min.)</label>
              <input type="number" {...register('minBathrooms')} className="p-4 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 font-bold text-center" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" {...register('parkingRequired')} id="parking" className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="parking" className="font-bold text-slate-700 cursor-pointer group-hover:text-blue-600 transition-colors">Cochera obligatoria</label>
            </div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" {...register('elevatorRequired')} id="elevator_req" className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="elevator_req" className="font-bold text-slate-700 cursor-pointer group-hover:text-blue-600 transition-colors">Ascensor obligatorio</label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')} 
              className="px-10 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-colors"
            >
              Descartar
            </button>
            <button 
              type="submit" 
              disabled={isSaving} 
              className="btn btn-primary px-12 py-4 min-w-[240px] shadow-xl shadow-blue-500/20"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
              Guardar Preferencias
            </button>
          </div>
      </form>
    </div>
  );
};

export default RequirementForm;
