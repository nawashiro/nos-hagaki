"use client";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useContext } from "react";
import { DoubleReagionContext } from "@/src/context";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MdOutlineOpenInNew } from "react-icons/md";
import { Region } from "@/src/getRegions";
import { GeodesicLine } from "leaflet.geodesic";
const { encode } = require("pluscodes");

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

const CustumMarker = ({ region }: { region: Region }) => {
  const pluscode = encode({
    latitude: region.latitude,
    longitude: region.longitude,
  });
  return (
    <Marker position={[region.latitude, region.longitude]}>
      <Popup>
        {region.countryName.ja}
        <br />
        {pluscode}
        <br />
        <a
          className="underline hover:text-neutral-300"
          href={`https://www.google.com/maps/place/${encodeURIComponent(
            pluscode
          )}`}
          target="_blank"
        >
          Googleマップ
          <MdOutlineOpenInNew className="inline-block h-3 w-3 mb-[4.9px]" />
        </a>
      </Popup>
    </Marker>
  );
};

const InnerComponent = ({
  addressRegion,
  myRegion,
}: {
  addressRegion: Region;
  myRegion: Region;
}) => {
  const map = useMap();
  map.fitBounds([
    [addressRegion.latitude, addressRegion.longitude],
    [myRegion.latitude, myRegion.longitude],
  ]);

  new GeodesicLine(
    [
      [addressRegion.latitude, addressRegion.longitude],
      [myRegion.latitude, myRegion.longitude],
    ],
    { dashArray: "16 16" }
  ).addTo(map);
  return null;
};

const LineMap = () => {
  const region = useContext(DoubleReagionContext);

  return (
    region && (
      <MapContainer
        zoom={3}
        center={[region.address.latitude, region.address.longitude]}
        scrollWheelZoom={false}
        className="h-64 w-full rounded-2xl z-0"
      >
        {region && (
          <InnerComponent addressRegion={region.address} myRegion={region.my} />
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CustumMarker region={region.address} />
        <CircleMarker
          center={[region.my.latitude, region.my.longitude]}
          radius={8}
        />
      </MapContainer>
    )
  );
};

export default LineMap;
