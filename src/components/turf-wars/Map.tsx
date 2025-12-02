
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Territory } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

// Leaflet's default icon URLs can break in Next.js. This is a common workaround.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapProps {
    territories: Territory[];
    isLoading: boolean;
}

// This is the map component.
export function Map({ territories, isLoading }: MapProps) {
    const defaultPosition: [number, number] = [37.7749, -122.4194];

    if (isLoading) {
        return <Skeleton className="w-full h-full" />
    }

    return (
        <MapContainer center={defaultPosition} zoom={13} scrollWheelZoom={false} className="w-full h-full rounded-lg z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {territories.map(territory => (
                <Marker key={territory.id} position={[territory.lat, territory.lng]}>
                    <Popup>
                       <div className="font-bold">{territory.name}</div>
                       {territory.controlledBy ? (
                           <div className="text-sm">Controlled by: <span className="text-primary">{territory.controlledBy}</span></div>
                       ) : (
                           <div className="text-sm italic text-muted-foreground">Unclaimed</div>
                       )}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
