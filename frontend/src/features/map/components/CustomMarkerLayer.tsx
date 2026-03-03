import { MapPin } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { CUSTOM_MARKER_CONFIG } from '../constants/customMarkerConfig';
import { getFloorDistance } from '../../../utils/floorUtils';
import type { UserMapMarker } from '../../../types/marker';

interface MapBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Props {
  markers: UserMapMarker[];
  mapBounds: MapBounds;
  activeFloor: string | null;
  floors: { floorId: string }[];
  onMarkerClick: (marker: UserMapMarker, e: React.MouseEvent) => void;
  activeMarkerId?: number | null;
}


export default function CustomMarkerLayer({
  markers,
  mapBounds,
  activeFloor,
  floors,
  onMarkerClick,
  activeMarkerId,
}: Props) {
  return (
    <>
      {markers.map((marker) => {
        const dist = getFloorDistance(marker.floorId, activeFloor, floors);
        const ml = mapBounds.left + (marker.positionX / 100) * mapBounds.width;
        const mt = mapBounds.top + (marker.positionY / 100) * mapBounds.height;
        const config = CUSTOM_MARKER_CONFIG[marker.type];
        const markerColor = marker.color ?? config.color;
        const isActive = activeMarkerId === marker.id;

        return (
          <div
            key={`custom-${marker.id}`}
            className="absolute group cursor-pointer"
            style={{
              left: `${ml}px`,
              top: `${mt}px`,
              transform: 'translate(-50%, -50%)',
              opacity: dist === 0 ? 1 : dist === 1 ? 0.4 : 0.2,
              filter: dist > 0 ? `blur(${Math.min(dist, 2)}px)` : 'none',
              zIndex: dist === 0 ? 11 : 6,
              transition: 'opacity 0.3s, filter 0.3s',
            }}
            onClick={(e) => onMarkerClick(marker, e)}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center transition-transform group-hover:scale-125',
                isActive ? 'scale-125 ring-2 ring-white/50' : ''
              )}
              style={{
                backgroundColor: markerColor,
                boxShadow: `0 0 8px ${marker.color ? `${markerColor}99` : config.glowColor}`,
              }}
            >
              <MapPin size={9} className="text-white" />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
              <div className="bg-bg/90 backdrop-blur-sm text-text text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: markerColor }}
                />
                {marker.title}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
