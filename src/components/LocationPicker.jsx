import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode } from '../utils/geo';

const MAP_TILES = [
  {
    key: 'light',
    label: 'Claro',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    key: 'dark',
    label: 'Oscuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    key: 'satellite',
    label: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP',
  },
];

const pickerIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;
    background:#22c55e;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 10px #22c55e88;
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

function FlyToCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14, { animate: true });
  }, [center?.[0], center?.[1], map]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

async function reverseGeocodeLocal(lat, lng) {
  return reverseGeocode(lat, lng);
}

export default function LocationPicker({ latitud, longitud, onChange, initialCenter }) {
  const [position, setPosition] = useState(() => {
    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);
    return !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;
  });
  const [geocoding, setGeocoding] = useState(false);
  const [mapStyle, setMapStyle] = useState(() => localStorage.getItem('ga-map-style') || 'light');
  const tile = MAP_TILES.find((t) => t.key === mapStyle) ?? MAP_TILES[0];

  const handleStyleChange = (key) => {
    setMapStyle(key);
    localStorage.setItem('ga-map-style', key);
  };

  const handlePick = useCallback(
    async (latlng) => {
      setPosition(latlng);
      setGeocoding(true);
      const { municipio, departamento } = await reverseGeocodeLocal(latlng.lat, latlng.lng);
      setGeocoding(false);
      onChange(latlng.lat, latlng.lng, municipio, departamento);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500">
        {geocoding
          ? <span className="text-green-400 animate-pulse">Obteniendo ubicación...</span>
          : position
          ? `Seleccionado: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
          : 'Haz clic en el mapa para fijar la ubicación exacta'}
      </p>
      <div className="relative">
        {/* Selector de estilo de mapa */}
        <div className="absolute top-2 right-2 z-[1000] flex gap-0.5 bg-gray-950/90 backdrop-blur border border-gray-700 rounded-lg p-0.5">
          {MAP_TILES.map((t) => (
            <button
              key={t.key}
              onClick={() => handleStyleChange(t.key)}
              title={t.label}
              type="button"
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                mapStyle === t.key
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="h-56 sm:h-80 lg:h-[420px]" style={{ borderRadius: '0.75rem', overflow: 'hidden', isolation: 'isolate' }}>
          <MapContainer
            center={initialCenter ?? [4.5709, -74.2973]}
            zoom={initialCenter ? 14 : 6}
            style={{ height: '100%', width: '100%' }}
            className={`ga-map-${mapStyle}`}
          >
            <TileLayer
              url={tile.url}
              attribution={tile.attribution}
            />
            <ClickHandler onPick={handlePick} />
            <FlyToCenter center={initialCenter} />
            {position && <Marker position={position} icon={pickerIcon} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
