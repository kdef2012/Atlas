'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Guild, Fireteam } from '@/lib/types';
import { Building2, Users } from 'lucide-react';

// Fix for default marker icon issue with webpack
const guildIcon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for Fireteams
const fireteamIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    className: 'bg-accent/20 rounded-full border-2 border-accent p-1',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
});


export default function WorldMap() {
    const firestore = useFirestore();
    
    const guildsCollection = useMemoFirebase(() => collection(firestore, 'guilds'), [firestore]);
    const { data: guilds, isLoading: isLoadingGuilds } = useCollection<Guild>(guildsCollection);

    const fireteamsCollection = useMemoFirebase(() => collection(firestore, 'fireteams'), [firestore]);
    const { data: fireteams, isLoading: isLoadingFireteams } = useCollection<Fireteam>(fireteamsCollection);

    const isLoading = isLoadingGuilds || isLoadingFireteams;

    if (isLoading) {
        return <div className="h-full w-full bg-muted animate-pulse" />;
    }
    
    // Convert a region name into a consistent, pseudo-random coordinate.
    // This is a simple hashing function to ensure the pin is placed in a general but not exact location.
    const getPositionFromRegion = (region: string): [number, number] => {
        let hash = 0;
        for (let i = 0; i < region.length; i++) {
            hash = region.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Use a seeded pseudo-random number generator for consistency
        const pseudoRandom = (seed: number) => {
            let x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        const lat = (pseudoRandom(hash) * 170) - 85; // Latitude between -85 and 85
        const lon = (pseudoRandom(hash / 2) * 360) - 180; // Longitude between -180 and 180
        
        return [lat, lon];
    }

    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} className="rounded-b-lg">
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {/* Guild Markers */}
            {guilds?.map(guild => {
                if (!guild.region) return null;
                
                const position = getPositionFromRegion(guild.region);
                return (
                    <Marker key={`guild-${guild.id}`} position={position} icon={guildIcon}>
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
             {/* Fireteam Markers */}
            {fireteams?.map(fireteam => {
                if (!fireteam.region) return null;
                
                // Add a small random offset to prevent direct overlap with guild pins
                const position = getPositionFromRegion(fireteam.region).map(coord => coord + (Math.random() - 0.5) * 0.5) as [number, number];
                
                return (
                    <Marker key={`fireteam-${fireteam.id}`} position={position} icon={fireteamIcon}>
                        <Popup>
                           <div className="font-bold flex items-center gap-1 text-accent">
                             <Users className="w-4 h-4" /> {fireteam.name}
                           </div>
                           <p className="text-xs text-muted-foreground">{fireteam.region}, {fireteam.state}</p>
                           <p className="text-xs">{Object.keys(fireteam.members || {}).length} members</p>
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    );
}
