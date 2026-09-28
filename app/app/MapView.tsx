
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Monastery } from './types';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

interface MapViewProps {
  houses: Monastery[];
}

function BoundsFitter({ houses }: { houses: Monastery[] }) {
  const map = useMap();

  useEffect(() => {
    const validCoords = houses
      .map(h => h.map_lat_lng)
      .filter((c): c is [number, number] => c !== null && Array.isArray(c) && c.length === 2);

    if (validCoords.length === 1) {
      map.setView(validCoords[0], 9);
    } else if (validCoords.length > 1) {
      const bounds = L.latLngBounds(validCoords.map(c => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [houses, map]);

  return null;
}

export default function MapView({ houses }: MapViewProps) {
  const mappedHouses = houses.filter(
    h => h.map_lat_lng && Array.isArray(h.map_lat_lng) && h.map_lat_lng.length === 2
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ marginBottom: '10px', fontSize: '0.9em', color: '#555' }}>
        Showing <strong>{mappedHouses.length}</strong> houses on map out of {houses.length} total.
      </div>
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        scrollWheelZoom={true}
        style={{ height: '650px', width: '100%', borderRadius: '8px', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsFitter houses={houses} />
        {mappedHouses.map(house => (
          <Marker key={house.id} position={house.map_lat_lng as [number, number]}>
            <Popup>
              <div style={{ minWidth: '220px', lineHeight: '1.4' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.05em', color: '#003366' }}>
                  {house.name}
                </h4>
                <div style={{ fontSize: '0.85em', color: '#444', marginBottom: '6px' }}>
                  <strong>{house.religious_order}</strong><br />
                  <span>{house.church_rite}</span>
                </div>
                <div style={{ fontSize: '0.85em', marginBottom: '8px' }}>
                  📍 {house.city ? `${house.city}, ` : ''}{house.state_province}, {house.country}<br />
                  🏷️ {house.is_cloistered ? 'Cloistered' : 'Apostolic'} &bull; {house.is_mens_house ? "Men's" : "Women's"}
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.85em' }}>
                  <Link href={`/monastery/${house.id}`} style={{ color: '#0056b3', fontWeight: 'bold' }}>
                    View Full Details &rarr;
                  </Link>
                  {house.website_url && (
                    <a href={house.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#555' }}>
                      Website ↗
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
