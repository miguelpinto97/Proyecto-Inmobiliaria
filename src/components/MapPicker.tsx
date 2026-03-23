import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
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
    <div className="h-[380px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0 flex flex-col">
      <div className="flex-1 relative">
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
          <div className="absolute inset-0 z-[1000] bg-white/40 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white/90 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-blue-50">
              <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-600 font-black text-xs uppercase tracking-widest">Obteniendo dirección...</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col gap-1 items-center justify-center shrink-0">
        <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
          <MapPin size={12} className={isGeocoding ? 'animate-bounce text-blue-500' : ''} />
          <span>{isGeocoding ? 'Sincronizando...' : 'Haz clic para ubicar la propiedad'}</span>
        </div>
        {!isGeocoding && (
          <span className="text-blue-500 lowercase italic normal-case font-bold tracking-tight text-[11px] opacity-70 text-center">
            La dirección y el número se detectarán automáticamente.<br></br>De no ser así, puedes agregar el número manualmente.
          </span>
        )}
      </div>
    </div>
  );
};

export default MapPicker;
