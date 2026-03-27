import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Phone, Mail, Save, Loader2, ChevronLeft, CheckCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      firstName: user?.firstname || '',
      lastName: user?.lastname || '',
      phone: user?.phone || ''
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstname,
        lastName: user.lastname,
        phone: user.phone || ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      await userService.updateProfile(data);
      await refreshUser();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error actualizando perfil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mi Perfil</h1>
          <p className="text-slate-500 font-medium">Mantén tu información actualizada para publicar propiedades.</p>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold animate-bounce-subtle">
          <CheckCircle size={20} />
          ¡Perfil actualizado con éxito!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-black uppercase tracking-widest text-slate-400">Nombre</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                {...register('firstName', { required: true })} 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black uppercase tracking-widest text-slate-400">Apellido</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                {...register('lastName', { required: true })} 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black uppercase tracking-widest text-slate-400">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                {...register('phone', { required: true })} 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 transition-all"
                placeholder="Ej: 987654321"
              />
            </div>
          </div>

        </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black uppercase tracking-widest text-slate-400">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>

        <button 
          type="submit" 
          disabled={isSaving} 
          className="w-full btn btn-primary py-4 text-lg"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} className="mr-2" />}
          Guardar Cambios
        </button>
      </form>

      {user && !user.roles.includes('Vendedor') && (
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-blue-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
          <h3 className="text-2xl font-black tracking-tight">¿Quieres vender tus propiedades?</h3>
          <p className="text-blue-100 font-medium">Actualiza tu cuenta a un perfil de Vendedor para empezar a publicar tus inmuebles hoy mismo.</p>
          <button 
            onClick={async () => {
              try {
                await userService.upgradeToSeller();
                await refreshUser();
                alert('¡Felicidades! Ahora eres Vendedor.');
              } catch (e) {
                alert('Error al actualizar rol.');
              }
            }}
            className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black hover:bg-blue-50 transition-all"
          >
            Quiero ser Vendedor
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
