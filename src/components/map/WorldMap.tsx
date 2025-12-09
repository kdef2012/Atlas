
'use client';

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { SkillCategory } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/types';

// Fix for default marker icon issue with webpack - though we are not using it now.
const defaultIcon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Define the structure for a region's data passed to the map
interface RegionData {
    id: string;
    name: string;
    dominantFaction: SkillCategory | null;
    scores: [SkillCategory, number][];
}

interface WorldMapProps {
    regions?: RegionData[];
    isLoading?: boolean;
}

export default function WorldMap({ regions, isLoading }: WorldMapProps) {
    
    if (isLoading) {
        return <div className="h-full w-full bg-muted animate-pulse" />;
    }
    
    // Convert a region name into a consistent, pseudo-random coordinate.
    const getPositionFromRegion = (region: string): [number, number] => {
        let hash = 0;
        for (let i = 0; i < region.length; i++) {
            hash = region.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        
        const pseudoRandom = (seed: number) => {
            let x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        const lat = (pseudoRandom(hash) * 170) - 85;
        const lon = (pseudoRandom(hash / 2) * 360) - 180;
        
        return [lat, lon];
    }

    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} className="rounded-b-lg">
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {regions?.map(region => {
                if (!region.name) return null;

                const position = getPositionFromRegion(region.name);
                const totalScore = region.scores.reduce((sum, [, score]) => sum + score, 0);
                const radius = Math.max(10, Math.log(totalScore + 1) * 5); // Log scale for radius

                const color = region.dominantFaction
                    ? CATEGORY_COLORS[region.dominantFaction]
                    : '#888888'; // Gray for no dominant faction

                return (
                    <CircleMarker
                        key={region.id}
                        center={position}
                        radius={radius}
                        pathOptions={{
                            color: color,
                            fillColor: color,
                            fillOpacity: 0.5
                        }}
                    >
                        <Popup>
                           <div className="font-bold text-lg mb-2">{region.name} Faction Scores</div>
                           <div className="space-y-1">
                               {region.scores.map(([faction, score]) => {
                                   const Icon = CATEGORY_ICONS[faction];
                                   const factionColor = CATEGORY_COLORS[faction];
                                   return (
                                       <div key={faction} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 font-semibold" style={{ color: factionColor }}>
                                                <Icon className="w-4 h-4" />
                                                {faction}
                                            </span>
                                            <span className="font-mono">{score.toLocaleString()} pts</span>
                                       </div>
                                   )
                               })}
                           </div>
                        </Popup>
                    </CircleMarker>
                )
            })}
        </MapContainer>
    );
}
