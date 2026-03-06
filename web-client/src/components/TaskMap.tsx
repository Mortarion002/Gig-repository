'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Next.js missing Leaflet marker 
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Task {
    id: string;
    title: string;
    description: string;
    price: number;
    latitude: number;
    longitude: number;
    client?: { firstName: string; lastName: string };
}

interface TaskMapProps {
    tasks: Task[];
}

export default function TaskMap({ tasks }: TaskMapProps) {
    // Default center (e.g., center of the US, or you can change this to your local city)
    const defaultCenter: [number, number] = [39.8283, -98.5795];
    const zoomLevel = 4;

    return (
        <MapContainer center={defaultCenter} zoom={zoomLevel} className="w-full h-full rounded-lg shadow-sm z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {tasks.map((task) => (
                <Marker key={task.id} position={[task.latitude, task.longitude]}>
                    <Popup>
                        <div className="p-1">
                            <h3 className="font-bold text-lg mb-1">{task.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    ${task.price}
                                </span>
                                <span className="text-xs text-gray-500">
                                    By {task.client?.firstName || 'User'}
                                </span>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}