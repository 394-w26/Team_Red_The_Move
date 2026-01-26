import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Move, ActivityType } from '../types';
import { getDefaultCoordinatesForArea } from '../utilities/locations';
import { MapMoveCard } from './MapMoveCard';

// Helper to create category-specific markers
const createCategoryIcon = (category: ActivityType) => {
  const colors: Record<ActivityType, string> = {
    Sports: '#2c1b4b', // Deep Purple (Plum)
    Food: '#fef3c7',   // Light Gold
    Study: '#f9c45c',  // Deep Gold
    Social: '#e0d7ec', // Light Purple
    Other: '#6a6279',  // Gray
  };

  const textColors: Record<ActivityType, string> = {
    Sports: '#fff',
    Food: '#92400e',
    Study: '#fff',
    Social: '#4e2a84',
    Other: '#fff',
  };

  const icons: Record<ActivityType, string> = {
    Sports: '⚽',
    Food: '🍴',
    Study: '📚',
    Social: '👥',
    Other: '📍',
  };

  return L.divIcon({
    html: `<div style="
      background-color: ${colors[category]};
      color: ${textColors[category]};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${icons[category]}</div>`,
    className: 'custom-category-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Helper to create user location marker
const createUserLocationIcon = () => {
  return L.divIcon({
    html: `<div style="
      background-color: #3b82f6;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        background-color: #3b82f6;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 2s infinite;
      "></div>
    </div>`,
    className: 'user-location-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

type MapViewProps = {
  moves: Move[];
  now: number;
  userName: string;
  onJoinMove: (moveId: string) => void;
  onLeaveMove: (moveId: string) => void;
  onSelectMove: (moveId: string) => void;
  userLocation?: { latitude: number; longitude: number } | null;
};

export const MapView = ({
  moves,
  now,
  userName,
  onJoinMove,
  onLeaveMove,
  onSelectMove,
  userLocation,
}: MapViewProps) => {
  // Northwestern campus center coordinates
  const mapCenter = [42.0500, -87.6750] as [number, number];
  const mapZoom = 14;

  return (
    <div className="map-container">
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {moves.map((move) => {
          // Use provided coordinates or calculate from area
          let lat = move.latitude;
          let lng = move.longitude;
          if (lat === undefined || lng === undefined) {
            const defaultCoords = getDefaultCoordinatesForArea(move.area);
            lat = defaultCoords.latitude;
            lng = defaultCoords.longitude;
          }

          return (
            <Marker 
              key={move.id} 
              position={[lat, lng]} 
              icon={createCategoryIcon(move.activityType)}
            >
              <Popup>
                <MapMoveCard
                  move={move}
                  now={now}
                  userName={userName}
                  onJoinMove={onJoinMove}
                  onLeaveMove={onLeaveMove}
                  onSelectMove={onSelectMove}
                  userLocation={userLocation}
                />
              </Popup>
            </Marker>
          );
        })}

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createUserLocationIcon()}
          >
            <Popup>
              <div style={{ textAlign: 'center', padding: '8px' }}>
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
