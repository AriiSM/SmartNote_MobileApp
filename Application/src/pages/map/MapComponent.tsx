import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

const MapComponent = ({ note, setNote }) => {
    const map = useMap();

    useEffect(() => {
        const container = document.getElementById("map-container");
        if (container && map) {
            const resizeObserver = new ResizeObserver(() => {
                map.invalidateSize();
            });

            resizeObserver.observe(container);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, [map]);

    useMapEvents({
        click: (e) => {
            if(setNote){
                const { lat, lng } = e.latlng;
                setNote((prevNote) => ({ ...prevNote, coords: { lat, lng } }));
            }
        },
    });

    return null;
};

export default MapComponent;
