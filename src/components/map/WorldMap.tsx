
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Guild } from '@/lib/types';
import { Building2 } from 'lucide-react';

// Fix for default marker icon issue with webpack
const icon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function WorldMap() {
    const firestore = useFirestore();
    const guildsCollection = useMemoFirebase(() => collection(firestore, 'guilds'), [firestore]);
    const { data: guilds, isLoading } = useCollection<Guild>(guildsCollection);

    if (isLoading) {
        return <div className="h-full w-full bg-muted animate-pulse" />;
    }
    
    // Placeholder: We need a way to get lat/lon from a guild's region.
    // For now, we'll just scatter them randomly.
    const getGuildPosition = (guildId: string): [number, number] => {
        // Simple hash function to create pseudo-random but consistent coordinates
        let hash = 0;
        for (let i = 0; i < guildId.length; i++) {
            hash = guildId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const lat = (hash % 180) - 90;
        const lon = (hash % 360) - 180;
        return [lat, lon];
    }

    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} className="rounded-b-lg">
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {guilds?.map(guild => {
                const position = getGuildPosition(guild.id);
                return (
                    <Marker key={guild.id} position={position} icon={icon}>
                        <Popup>
                           <div className="font-bold flex items-center gap-1">
                             <Building2 className="w-4 h-4" /> {guild.name}
                           </div>
                           <p className="text-xs text-muted-foreground">{guild.region}</p>
                           <p className="text-xs">{Object.keys(guild.members || {}).length} members</p>
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    );
}
