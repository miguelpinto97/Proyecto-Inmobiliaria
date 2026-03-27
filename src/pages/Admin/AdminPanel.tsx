import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, propertyService } from '../../services/api';
import {
  ShieldCheck, User as UserIcon, CheckCircle, XCircle,
  LayoutGrid, Users, ExternalLink, Settings,
  Shield, RefreshCcw, Search, Loader2, Home,
  ChevronUp, ChevronDown
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [users, setUsers] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [commonValues, setCommonValues] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingValue, setEditingValue] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [pendingOrderChanges, setPendingOrderChanges] = useState<Record<string, number>>({});

  const fetchCommonValues = async () => {
    try {
      const res = await adminService.getCommonValues();
      setCommonValues(res.data);
      if (!selectedType && Object.keys(res.data).length > 0) {
        setSelectedType(Object.keys(res.data)[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };


  const fetchPending = async () => {
    try {
      const res = await propertyService.getAll({ status: 'Pendiente' });
      setPendingProperties(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      if (activeTab === 'properties') await fetchPending();
      if (activeTab === 'users') await fetchUsers();
      if (activeTab === 'values') await fetchCommonValues();
      setIsLoading(false);
    };
    load();
  }, [activeTab]);

  const handleValueToggle = async (val: any) => {
    try {
      await adminService.updateCommonValue({
        tipo: val.tipo,
        codigo: val.codigo,
        activo: !val.activo
      });
      await fetchCommonValues();
    } catch (e) {
      alert('Error actualizando valor');
    }
  };

  const handleValueSave = async (data: any) => {
    try {
      if (editingValue?.isNew) {
        await adminService.upsertCommonValue(data);
      } else {
        await adminService.updateCommonValue(data);
      }
      setEditingValue(null);
      await fetchCommonValues();
    } catch (e) {
      alert('Error guardando valor');
    }
  };

  const handleOrderUpdateLocal = (val: any, delta: number) => {
    const items = commonValues[selectedType] || [];
    const getEffectiveOrder = (item: any) => {
      const pending = pendingOrderChanges[`${item.tipo}-${item.codigo}`];
      return pending !== undefined ? pending : item.orden;
    };

    const currentOrden = getEffectiveOrder(val);
    const newOrden = currentOrden + delta;
    if (newOrden < 1) return;

    const targetItem = items.find((item: any) => getEffectiveOrder(item) === newOrden);
    const updates = { ...pendingOrderChanges };

    updates[`${val.tipo}-${val.codigo}`] = newOrden;
    if (targetItem) {
      updates[`${targetItem.tipo}-${targetItem.codigo}`] = currentOrden;
    }
    setPendingOrderChanges(updates);
  };

  const saveAllOrderChanges = async () => {
    try {
      setIsLoading(true);
      const updates = Object.entries(pendingOrderChanges).map(([key, orden]) => {
        const [tipo, codigo] = key.split('-');
        return adminService.updateCommonValue({ tipo, codigo, orden });
      });

      await Promise.all(updates);
      setPendingOrderChanges({});
      await fetchCommonValues();
      alert('Cambios guardados con éxito');
    } catch (e) {
      alert('Error guardando cambios de orden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!confirm(`¿Estás seguro de que deseas ${status === 'Aprobada' ? 'aprobar' : 'rechazar'} esta propiedad?`)) return;
    try {
      await adminService.updatePropertyStatus(id, status);
      setPendingProperties(pendingProperties.filter((p: any) => p.id !== Number(id)));
    } catch (e) {
      alert('Error actualizando estado');
    }
  };

  const handleUserUpdate = async (userData: any) => {
    try {
      await adminService.updateUser(userData);
      setEditingUser(null);
      fetchUsers();
    } catch (e) {
      alert('Error actualizando usuario');
    }
  };

  const toggleAdminRole = (user: any) => {
    const hasAdmin = user?.roles?.includes('Admin');
    const action = hasAdmin ? 'quitar el permiso de Administrador a' : 'hacer Administrador a';

    if (!confirm(`¿Estás seguro de que deseas ${action} ${user.firstname} ${user.lastname}?`)) return;

    const newRoles = hasAdmin
      ? user.roles.filter((r: string) => r !== 'Admin')
      : [...(user.roles || []), 'Admin'];

    handleUserUpdate({ id: user.id, roles: newRoles });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 animate-fade-in pb-20 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center gap-4 md:gap-6">
          <div className="bg-blue-600 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-lg ring-4 ring-blue-600/20">
            <ShieldCheck size={32} className="md:w-10 md:h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">Panel Admin</h1>
            <p className="text-blue-100/60 text-xs md:text-base font-medium">Gestión y moderación.</p>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 relative z-10 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-md">
            <span className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Usuarios</span>
            <span className="text-lg md:text-2xl font-black">{users.length || '--'}</span>
          </div>
          <div className="flex-1 md:flex-none bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-md">
            <span className="block text-[8px] md:text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">Pendientes</span>
            <span className="text-lg md:text-2xl font-black">{pendingProperties.length || '0'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 md:p-2 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm sticky top-0 z-40 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-none md:flex-1 px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'properties' ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Home size={18} className="md:w-5 md:h-5" />
          <span className="text-xs md:text-sm">Moderación</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-none md:flex-1 px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Users size={18} className="md:w-5 md:h-5" />
          <span className="text-xs md:text-sm">Usuarios</span>
        </button>
        <button
          onClick={() => setActiveTab('values')}
          className={`flex-none md:flex-1 px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'values' ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LayoutGrid size={18} className="md:w-5 md:h-5" />
          <span className="text-xs md:text-sm">Diccionario</span>
        </button>
      </div>

      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center py-32 text-blue-500">
            <Loader2 className="w-12 h-12 animate-spin" />
          </div>
        ) : activeTab === 'properties' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-2xl font-black text-slate-800">Solicitudes Pendientes</h3>
              <button onClick={fetchPending} className="p-3 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 transition-colors shadow-sm">
                <RefreshCcw size={18} />
              </button>
            </div>

            {pendingProperties.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {pendingProperties.map((p: any) => (
                  <div key={p.id} className="bg-white p-4 md:p-6 rounded-[1.2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <div className="w-full md:w-48 h-40 md:h-32 rounded-2xl md:rounded-3xl bg-slate-100 overflow-hidden shrink-0 border border-slate-50">
                      <img src={p.mainimage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} className="w-full h-full object-cover" alt="" />
                    </div>

                    <div className="flex-grow space-y-1 md:space-y-2 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">{p.operation_code}</span>
                        <span className="text-[10px] text-slate-400 font-bold">#{p.id}</span>
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">{p.status_desc}</span>
                      </div>
                      <h4 className="text-lg md:text-xl font-black text-slate-900 line-clamp-1">{p.address}</h4>
                      <p className="text-xl md:text-2xl font-black text-blue-600">S/ {Number(p.price).toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2 md:gap-4 shrink-0 w-full md:w-auto">
                      <Link to={`/propiedades/${p.id}`} className="flex-1 md:flex-none p-3 md:p-4 bg-slate-50 text-slate-600 rounded-xl md:rounded-2xl hover:bg-slate-100 transition-colors shadow-sm flex items-center justify-center">
                        <ExternalLink size={20} className="md:w-6 md:h-6" />
                      </Link>
                      <button onClick={() => handleStatusUpdate(p.id.toString(), 'Aprobada')} className="flex-[2] md:flex-none p-3 md:p-4 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl hover:bg-emerald-100 transition-colors shadow-sm flex items-center justify-center gap-2 font-bold text-sm">
                        <CheckCircle size={20} className="md:w-6 md:h-6" />
                        <span className="md:hidden">Aprobar</span>
                      </button>
                      <button onClick={() => handleStatusUpdate(p.id.toString(), 'Rechazada')} className="flex-[2] md:flex-none p-3 md:p-4 bg-red-50 text-red-600 rounded-xl md:rounded-2xl hover:bg-red-100 transition-colors shadow-sm flex items-center justify-center gap-2 font-bold text-sm">
                        <XCircle size={20} className="md:w-6 md:h-6" />
                        <span className="md:hidden">Rechazar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-inner">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h4 className="text-xl font-black text-slate-800 mb-2">¡Todo al día!</h4>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">No hay propiedades pendientes de revisión en este momento.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'values' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black text-slate-800">Diccionario de Valores</h3>
                <p className="text-slate-500 font-medium">Categorías del sistema y sus opciones permitidas.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {Object.keys(pendingOrderChanges).length > 0 && (
                  <button
                    onClick={saveAllOrderChanges}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] md:text-xs shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all animate-in fade-in zoom-in h-11 md:h-14 whitespace-nowrap"
                  >
                    Guardar ({Object.keys(pendingOrderChanges).length})
                  </button>
                )}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="flex-grow md:w-64 p-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 transition-all shadow-sm"
                >
                  {Object.keys(commonValues).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button
                  onClick={() => setEditingValue({ tipo: selectedType, isNew: true })}
                  className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  <RefreshCcw size={18} />
                  Añadir
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto no-scrollbar scroll-smooth">
                <table className="w-full text-left min-w-[450px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Código</th>
                      <th className="px-4 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción</th>
                      <th className="px-4 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Orden</th>
                      <th className="px-4 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Estado</th>
                      <th className="px-4 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(commonValues[selectedType] || [])
                      .map((v: any) => ({
                        ...v,
                        effectiveOrden: pendingOrderChanges[`${v.tipo}-${v.codigo}`] !== undefined
                          ? pendingOrderChanges[`${v.tipo}-${v.codigo}`]
                          : v.orden
                      }))
                      .sort((a: any, b: any) => a.effectiveOrden - b.effectiveOrden)
                      .map((v: any) => {
                        const isChanged = pendingOrderChanges[`${v.tipo}-${v.codigo}`] !== undefined;

                        return (
                          <tr key={v.codigo} className={`transition-all duration-300 hover:bg-slate-50/50 group ${isChanged ? 'bg-blue-50/30' : ''}`}>
                            <td className="px-4 md:px-8 py-3 md:py-4 font-black text-slate-400 font-mono text-[10px]">{v.codigo}</td>
                            <td className="px-4 md:px-8 py-3 md:py-4 font-bold text-slate-700 text-xs md:text-sm">{v.descripcion}</td>
                            <td className="px-4 md:px-8 py-3 md:py-4 text-center">
                              <div className={`inline-flex items-center rounded-lg p-1 border transition-all ${isChanged ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                                <button
                                  onClick={() => handleOrderUpdateLocal(v, 1)}
                                  className="p-1 hover:bg-white hover:text-blue-600 rounded-md transition-all text-slate-400"
                                >
                                  <ChevronDown size={14} />
                                </button>
                                <span className={`w-8 text-center font-black text-[10px] ${isChanged ? 'text-blue-600' : 'text-slate-600'}`}>
                                  {v.effectiveOrden}
                                </span>
                                <button
                                  onClick={() => handleOrderUpdateLocal(v, -1)}
                                  className="p-1 hover:bg-white hover:text-blue-600 rounded-md transition-all text-slate-400"
                                >
                                  <ChevronUp size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 md:px-8 py-3 md:py-4 text-center">
                              <button
                                onClick={() => handleValueToggle(v)}
                                className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${v.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                              >
                                <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${v.activo ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                {v.activo ? 'Activo' : 'Inactivo'}
                              </button>
                            </td>
                            <td className="px-4 md:px-8 py-3 md:py-4 text-center">
                              <button
                                onClick={() => setEditingValue(v)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Settings size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
              <h3 className="text-2xl font-black text-slate-800">Directorio de Usuarios</h3>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" placeholder="Buscar usuario..." className="w-full pl-12 pr-4 py-2.5 md:py-3.5 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all shadow-sm font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((u: any) => (
                <div key={u.id} className="bg-white border border-slate-100 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                      <UserIcon size={28} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-lg font-black text-slate-900 truncate">{u.firstname} {u.lastname}</h4>
                      <p className="text-sm text-slate-400 truncate font-medium">{u.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Límite Activos</span>
                      <span className="text-sm font-black text-slate-700">{u.maxproperties}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rol Actual</span>
                      <div className="flex gap-1">
                        {u.roles.map((r: string) => (
                          <span key={r} className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${r === 'Admin' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-200 text-slate-600'}`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="flex-grow py-3.5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                    >
                      <Settings size={18} />
                      Gestionar
                    </button>
                    <button
                      onClick={() => toggleAdminRole(u)}
                      className={`p-3.5 rounded-2xl transition-all flex items-center gap-2 font-bold ${u?.roles?.includes('Admin') ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                      title={u?.roles?.includes('Admin') ? "Quitar Admin" : "Hacer Admin"}
                    >
                      <Shield size={20} />
                      <span className="text-[10px] uppercase tracking-widest">
                        {u?.roles?.includes('Admin') ? 'Quitar Admin' : 'Hacer Admin'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in zoom-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 bg-slate-900 text-white relative">
              <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                <XCircle size={24} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Settings size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black">Editar Usuario</h3>
                  <p className="text-blue-200/60 text-xs font-medium truncate">{editingUser.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 space-y-6 md:space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Capacidad Máxima (Propiedades)</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="number"
                    defaultValue={editingUser.maxproperties}
                    onChange={(e) => setEditingUser({ ...editingUser, maxproperties: Number(e.target.value) })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-black text-slate-700"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium px-1 italic">Este valor determina cuántas publicaciones puede crear el usuario simultáneamente.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUserUpdate({ id: editingUser.id, maxProperties: editingUser.maxproperties })}
                  className="flex-[2] py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingValue && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in zoom-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 bg-blue-600 text-white relative">
              <button onClick={() => setEditingValue(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                <XCircle size={24} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <LayoutGrid size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black">{editingValue.isNew ? 'Nuevo Valor' : 'Editar Valor'}</h3>
                  <p className="text-blue-100/60 text-xs font-medium uppercase tracking-widest">{editingValue.tipo}</p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleValueSave({
                tipo: editingValue.tipo,
                codigo: editingValue.codigo || formData.get('codigo'),
                descripcion: formData.get('descripcion'),
                orden: Number(formData.get('orden'))
              });
            }} className="p-6 md:p-10 space-y-4 md:space-y-6">

              {editingValue.isNew && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Código (Único)</label>
                  <input name="codigo" required placeholder="Ej: Miraflores" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700" />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Descripción</label>
                <input name="descripcion" required defaultValue={editingValue.descripcion} placeholder="Nombre visible" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Orden de Aparición</label>
                <input name="orden" type="number" defaultValue={editingValue.orden || 0} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700" />
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setEditingValue(null)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
