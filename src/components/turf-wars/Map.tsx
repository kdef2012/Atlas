
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Leaflet's default icon URLs can break in Next.js. This is a common workaround.
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// This is the map component.
// We will replace this with a real Leaflet map in the next step.
export function Map() {
    return (
        <MapContainer center={[37.7749, -122.4194]} zoom={13} scrollWheelZoom={false} className="w-full h-full rounded-lg z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[37.7749, -122.4194]}>
                <Popup>
                    A sample territory marker. <br /> We can customize this later.
                </Popup>
            </Marker>
        </MapContainer>
    )
}
