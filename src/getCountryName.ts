const pointInPolygon = require("point-in-polygon");

interface GeoJSONFeature {
  type: string;
  properties: {
    iso: string; // ISO 3166-1 alpha-2 code
    pais: string;
    ja: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][]; // MultiPolygon coordinates
  };
}

export interface CountryName {
  iso: string;
  pais: string;
  ja: string;
}

export function getCountryName(
  latitude: number,
  longitude: number,
  geojsonData: any
): CountryName | null {
  try {
    const geojson: GeoJSONFeature[] = geojsonData.features;

    for (const feature of geojson) {
      if (isPointInCountry(latitude, longitude, feature.geometry.coordinates)) {
        return feature.properties;
      }
    }

    return null; // No matching country found
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error reading or parsing GeoJSON file:", error.message);
    }
    return null;
  }
}

function isPointInCountry(
  latitude: number,
  longitude: number,
  coordinates: number[][][]
): boolean {
  // Check if the given latitude and longitude are within the country's boundaries
  // For each polygon, check if the point is inside it
  for (const polygon of coordinates) {
    if (pointInPolygon([longitude, latitude], polygon[0])) {
      return true;
    }
  }
  return false;
}
