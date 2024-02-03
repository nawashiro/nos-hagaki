"use client";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useContext } from "react";
import { RegionContext } from "@/src/context";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MdOutlineOpenInNew } from "react-icons/md";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

const Map = () => {
  const region = useContext(RegionContext);
  return (
    region &&
    region.latitude &&
    region.longitude && (
      <MapContainer
        center={[region.latitude, region.longitude]}
        zoom={3}
        scrollWheelZoom={false}
        className="h-64 w-full rounded-2xl z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[region.latitude, region.longitude]}>
          <Popup>
            {region.latitude}, {region.longitude} <br />{" "}
            <a
              className="underline hover:text-neutral-300"
              href={`https://maps.google.com/maps?q=${region.latitude},${region.longitude}`}
              target="_blank"
            >
              Googleマップ
              <MdOutlineOpenInNew className="inline-block h-3 w-3 mb-[4.9px]" />
            </a>
          </Popup>
        </Marker>
      </MapContainer>
    )
  );
};

export default Map;
