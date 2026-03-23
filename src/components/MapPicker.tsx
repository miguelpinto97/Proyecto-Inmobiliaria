import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Search, X, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange: (data: { lat: number; lng: number; address?: string; district?: string; isGeocoding?: boolean }) => void;
  defaultCenter?: [number, number]; // [lat, lng]
}

const LocationMarker: React.FC<{
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  onMove: (lat: number, lng: number) => void;
}> = ({ position, setPosition, onMove }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onMove(lat, lng);
    },
  });

  return position ? (
    <Marker position={position} draggable={true} eventHandlers={{
      dragend: (e: L.DragEndEvent) => {
        const marker = e.target;
        const pos = marker.getLatLng();
        setPosition([pos.lat, pos.lng]);
        onMove(pos.lat, pos.lng);
      }
    }} />
  ) : null;
};

// Component to handle map center updates when defaultCenter changes
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ value, onChange, defaultCenter = [-12.046374, -77.042793] }) => {
  const [position, setPosition] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search logic
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&countrycodes=pe&limit=5`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    onChange({ lat, lng, isGeocoding: true });

    const startTime = Date.now();
    let address = '';
    let district = '';

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'InmobiliariaModeloFlash/1.0'
        }
      });
      const data = await response.json();

      if (data.address) {
        // Detailed parsing for Peruvian format (e.g. "Jirón Justo Naveda 1035")
        const addr = data.address;
        const road = addr.road || addr.pedestrian || addr.path || addr.suburb || '';
        const houseNumber = addr.house_number || addr.street_number || '';

        if (road && houseNumber) {
          address = `${road} ${houseNumber}`;
        } else {
          // If no house number, try to see if it's in the display_name as a string
          address = road || (data.display_name?.split(',')[0] || '');
        }

        district = addr.suburb || addr.city_district || addr.neighbourhood || addr.city || '';
      }
    } catch (error) {
      console.error('Error geocoding:', error);
    }

    // Force minimum 2 seconds delay
    const elapsed = Date.now() - startTime;
    if (elapsed < 2000) {
      await new Promise(r => setTimeout(r, 2000 - elapsed));
    }

    setIsGeocoding(false);
    onChange({ lat, lng, address, district, isGeocoding: false });
  };

  return (
    <div className="h-full w-full relative z-0 flex flex-col bg-white">
      {/* Ultra-Minimal Search Header */}
      <div className="px-4 py-2 bg-white border-b border-slate-50 flex justify-center shrink-0 relative z-[1001]">
        <div className="w-full max-w-sm relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
          <input 
            type="text"
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            placeholder="Buscar dirección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 3 && setShowSuggestions(true)}
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setSuggestions([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}

          {/* Suggestions Dropdown (Compact) */}
          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 z-[1002]">
              {isSearching ? (
                <div className="p-3 flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                  <Loader2 className="animate-spin" size={12} />
                  Buscando...
                </div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-[180px] overflow-y-auto">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      className="w-full p-2.5 text-left hover:bg-slate-50 transition-colors flex items-start gap-2 group"
                      onClick={() => {
                        const lat = parseFloat(s.lat);
                        const lng = parseFloat(s.lon);
                        setPosition([lat, lng]);
                        setShowSuggestions(false);
                        setSearchQuery(s.display_name);
                        handleGeocode(lat, lng);
                      }}
                    >
                      <MapPin size={14} className="text-slate-300 group-hover:text-blue-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[11px] font-bold text-slate-700 truncate">{s.display_name.split(',')[0]}</span>
                        <span className="text-[9px] font-medium text-slate-400 truncate">{s.display_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={position || defaultCenter}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onMove={handleGeocode} />
          {position && <ChangeView center={position} />}
        </MapContainer>

        {isGeocoding && (
          <div className="absolute inset-0 z-[1000] bg-white/30 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-50">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">Sincronizando</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-2 border-t border-slate-100 flex items-center justify-center shrink-0">
        <div className="flex items-center gap-2 text-slate-400 font-black text-[9px] uppercase tracking-tighter opacity-60">
          <MapPin size={10} className={isGeocoding ? 'animate-bounce text-blue-500' : ''} />
          <span>{isGeocoding ? 'Espere...' : 'Arrastre el PIN para precisar'}</span>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
