import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface UserLocationMarkerProps {
    position: [number, number];
    userId: number;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position, userId }) => {
    const createUserIcon = () => {
        return L.divIcon({
            className: 'custom-user-marker',
            html: `
                <div style="
                    background-color: #4caf50;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                    animation: pulse 2s infinite;
                "></div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        });
    };

    return (
        <Marker position={position} icon={createUserIcon()}>
            <Popup>
                <div style={{ minWidth: 150 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>User Location</h3>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem' }}>
                        User ID: <strong>{userId}</strong>
                    </p>
                    <p style={{ margin: '0', fontSize: '0.8rem' }}>
                        Position: {position[0].toFixed(4)}, {position[1].toFixed(4)}
                    </p>
                </div>
            </Popup>
        </Marker>
    );
};

export default UserLocationMarker;
