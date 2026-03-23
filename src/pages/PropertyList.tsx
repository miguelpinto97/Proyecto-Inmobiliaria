import React, { useEffect, useState } from 'react';
import { propertyService } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { useCommonValues } from '../hooks/useCommonValues';
import { Search, SlidersHorizontal, Loader2, X, Filter, ChevronRight } from 'lucide-react';

const PriceSlider = ({ min, max, maxLimit, onChange }: { min: string, max: string, maxLimit: number, onChange: (min: string, max: string) => void }) => {
  const minVal = Math.min(parseInt(min) || 0, maxLimit);
  const maxVal = Math.min(parseInt(max) || maxLimit, maxLimit);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase">Min</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">S/</span>
            <input 
              type="number" 
              value={min} 
              onChange={(e) => onChange(e.target.value, max)}
              className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-100 bg-slate-50 text-xs font-black text-slate-700 outline-none focus:border-blue-500"
              placeholder="0"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-400 uppercase">Max</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">S/</span>
            <input 
              type="number" 
              value={max} 
              onChange={(e) => onChange(min, e.target.value)}
              className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-100 bg-slate-50 text-xs font-black text-slate-700 outline-none focus:border-blue-500"
              placeholder={maxLimit.toString()}
            />
          </div>
        </div>
      </div>

      <div className="relative h-2 bg-slate-100 rounded-full mt-4 mx-2">
        <input
          type="range"
          min="0"
          max={maxLimit}
          step={maxLimit > 100000 ? 10000 : 100}
          value={minVal}
          onChange={(e) => onChange(e.target.value, max)}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
        />
        <input
          type="range"
          min="0"
          max={maxLimit}
          step={maxLimit > 100000 ? 10000 : 100}
          value={maxVal}
          onChange={(e) => onChange(min, e.target.value)}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>
    </div>
  );
};

const PropertyList: React.FC = () => {
  const { values } = useCommonValues();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const handleOperationTypeToggle = (type: string) => {
    const currentTypes = filters.operationType ? filters.operationType.split(',') : [];
    let newTypes;
    if (currentTypes.includes(type)) {
      newTypes = currentTypes.filter(t => t !== type);
    } else {
      newTypes = [...currentTypes, type];
    }
    setFilters({ ...filters, operationType: newTypes.join(',') });
  };

  const priceLimit = (filters.operationType.includes('Venta') || filters.operationType === '') ? 1000000 : 10000;

  useEffect(() => {
    fetchProperties();
  }, [filters.operationType, filters.propertyType, filters.district]);

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
    <div className="max-w-7xl mx-auto animate-fade-in pb-20 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 px-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">Catálogo</h1>
          <p className="text-slate-500 font-medium">Explora propiedades exclusivas seleccionadas para ti.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 px-5"
          >
            <SlidersHorizontal size={18} />
            <span className="font-bold text-sm">Filtros</span>
          </button>
        </div>
      </div>

      {/* Filter Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Filter Sidebar (Now Left) */}
      <aside className={`
        fixed top-0 left-0 h-full w-full max-w-xs bg-white z-[101] shadow-2xl transition-transform duration-500 ease-out p-6 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
             <Filter size={20} className="text-blue-600" />
             Filtros
          </h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Ubicación..." 
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operación</label>
            <div className="flex flex-wrap gap-2">
              {values?.TipoOperacion?.map((v: any) => {
                const isActive = filters.operationType.split(',').includes(v.codigo);
                return (
                  <button
                    key={v.codigo}
                    onClick={() => handleOperationTypeToggle(v.codigo)}
                    className={`
                      px-4 py-2 rounded-xl text-xs font-black transition-all border-2
                      ${isActive 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
                    `}
                  >
                    {v.descripcion}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inmueble</label>
            <select 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none"
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
            >
              <option value="">Todos</option>
              {values?.TipoInmueble?.map((v: any) => (
                <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distrito</label>
            <select 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none"
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
            >
              <option value="">Todos</option>
              {values?.Distrito?.map((v: any) => (
                <option key={v.codigo} value={v.codigo}>{v.descripcion}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rango de Precio</label>
            <PriceSlider 
              min={filters.minPrice} 
              max={filters.maxPrice} 
              maxLimit={priceLimit}
              onChange={(min, max) => setFilters({ ...filters, minPrice: min, maxPrice: max })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Habs.</label>
              <input 
                type="number" 
                placeholder="0+"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                value={filters.rooms}
                onChange={(e) => setFilters({ ...filters, rooms: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Baños</label>
              <input 
                type="number" 
                placeholder="0+"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                value={filters.bathrooms}
                onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex flex-col gap-3">
          <button 
            onClick={fetchProperties}
            className="w-full bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 text-sm"
          >
            Aplicar Filtros
            <ChevronRight size={16} />
          </button>
          <button 
            onClick={clearFilters}
            className="w-full text-slate-400 font-bold py-1 text-xs hover:text-red-500 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </aside>

      {/* Property Grid */}
      {isLoading ? (
        <div className="flex justify-center py-32 text-blue-500">
          <Loader2 className="w-16 h-16 animate-spin" />
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {properties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-inner mx-4">
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
