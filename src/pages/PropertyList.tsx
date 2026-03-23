import React, { useEffect, useState } from 'react';
import { propertyService } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { useCommonValues } from '../hooks/useCommonValues';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';

const PropertyList: React.FC = () => {
  const { values } = useCommonValues();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    operationType: '', 
    propertyType: '',
    district: '',
    minPrice: '',
    maxPrice: '',
    rooms: '',
    bathrooms: '',
    search: '' 
  });

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const res = await propertyService.getAll({ 
        status: 'Aprobada',
        ...filters
      });
      setProperties(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters.operationType, filters.propertyType, filters.district]); // Auto-fetch on major filters

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const clearFilters = () => {
    setFilters({
      operationType: '',
      propertyType: '',
      district: '',
      minPrice: '',
      maxPrice: '',
      rooms: '',
      bathrooms: '',
      search: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Explorar Inmuebles</h1>
            <p className="text-slate-500 font-medium text-lg">Descubre las mejores oportunidades seleccionadas para ti.</p>
          </div>
          <button 
            onClick={clearFilters}
            className="text-slate-400 hover:text-blue-600 font-bold text-sm flex items-center gap-2 transition-colors px-4 py-2 hover:bg-blue-50 rounded-xl"
          >
            Limpiar filtros
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Main Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="¿Dónde quieres buscar? (Dirección, referencia...)" 
              className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 bg-slate-50/30"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="relative">
            <select 
              className="w-full pl-6 pr-10 py-4.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none bg-white font-black text-slate-600 cursor-pointer text-sm uppercase tracking-wider"
              value={filters.operationType}
              onChange={(e) => setFilters({ ...filters, operationType: e.target.value })}
            >
              <option value="">Operación</option>
              {values?.TipoOperacion?.map((v: any) => (
                <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select 
              className="w-full pl-6 pr-10 py-4.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none bg-white font-black text-slate-600 cursor-pointer text-sm uppercase tracking-wider"
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
            >
              <option value="">Tipo Inmueble</option>
              {values?.TipoInmueble?.map((v: any) => (
                <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div className="relative">
            <select 
              className="w-full pl-6 pr-10 py-4.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none bg-white font-black text-slate-600 cursor-pointer text-sm uppercase tracking-wider"
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
            >
              <option value="">Distrito</option>
              {values?.Distrito?.map((v: any) => (
                <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Precio Mín (S/)" 
              className="w-1/2 px-4 py-4.5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700 bg-white shadow-sm transition-all"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
            <input 
              type="number" 
              placeholder="Precio Máx (S/)" 
              className="w-1/2 px-4 py-4.5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700 bg-white shadow-sm transition-all"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>

          {/* Metrics */}
          <div className="flex gap-2">
             <input 
              type="number" 
              placeholder="Habs+" 
              className="w-1/2 px-4 py-4.5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700 bg-white shadow-sm text-center transition-all"
              value={filters.rooms}
              onChange={(e) => setFilters({ ...filters, rooms: e.target.value })}
            />
            <input 
              type="number" 
              placeholder="Baños+" 
              className="w-1/2 px-4 py-4.5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700 bg-white shadow-sm text-center transition-all"
              value={filters.bathrooms}
              onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
            />
          </div>

          <button 
            type="submit"
            className="bg-blue-600 text-white font-black py-4.5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
          >
            <SlidersHorizontal size={20} />
            Aplicar Filtros
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-32 text-blue-500">
          <Loader2 className="w-16 h-16 animate-spin" />
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {properties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-inner">
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="w-16 h-16 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Sin resultados</h3>
          <p className="text-slate-400 font-bold max-w-sm mx-auto">No hay propiedades que coincidan con estos criterios. Intenta flexibilizar tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default PropertyList;
