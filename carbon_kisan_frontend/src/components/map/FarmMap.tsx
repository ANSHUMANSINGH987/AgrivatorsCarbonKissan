"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, useMapEvents, useMap } from "react-leaflet";
import { Search, MapPin, Loader } from "lucide-react";

// Component that handles smooth flyTo animations
function MapFlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        duration: 2,
        easeLinearity: 0.25,
      });
    }
  }, [center, map, zoom]);

  return null;
}

// Component that handles the click event on the Leaflet map
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Location detection overlay component
function LocationDetectionOverlay({
  onLocationDetected,
  isInitializing,
  setLocationName,
}: {
  onLocationDetected: (lat: number, lon: number) => void;
  isInitializing: boolean;
  setLocationName?: (name: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, isSearchingState] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setErrorToast("Geolocation is not supported by your browser");
      setTimeout(() => setErrorToast(null), 4000);
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationName?.(`Current Location (${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)})`);
        onLocationDetected(position.coords.latitude, position.coords.longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        let message = "Unable to get your location";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Permission denied. Please enable location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location service unavailable";
        } else if (error.code === error.TIMEOUT) {
          message = "Request timed out";
        }
        setErrorToast(message);
        setTimeout(() => setErrorToast(null), 4000);
        setIsGettingLocation(false);
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setErrorToast("Please enter a village or city name");
      setTimeout(() => setErrorToast(null), 3000);
      return;
    }

    isSearchingState(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setLocationName?.(display_name || searchQuery);
        onLocationDetected(parseFloat(lat), parseFloat(lon));
      } else {
        setErrorToast("Location not found. Try a different search.");
        setTimeout(() => setErrorToast(null), 4000);
      }
    } catch (error) {
      setErrorToast("Search failed. Please try again.");
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      isSearchingState(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (isInitializing) return null;

  return (
    <>
      {/* Floating Location Detection Card */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] w-96 max-w-[calc(100%-2rem)]">
        <div className="bg-white rounded-full shadow-lg border border-gray-100 p-1 flex items-center gap-2">
          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2 px-4 py-3">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search village or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-full font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {isSearching && <Loader size={16} className="animate-spin" />}
            Search
          </button>
        </div>

        {/* Current Location Button */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={handleCurrentLocation}
            disabled={isGettingLocation}
            className="bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 px-6 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 shadow-md border border-blue-200"
          >
            {isGettingLocation ? (
              <>
                <Loader size={16} className="animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin size={16} />
                Use My Current Location
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-500 mt-3">
          Find your location to start mapping your farm boundary
        </p>
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1001]">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <span className="text-lg">!</span>
            <span className="text-sm font-medium">{errorToast}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default function FarmMap({
  onMapClick,
  geoJson,
  setGeoJson,
  setLocationName,
}: {
  onMapClick: (lat: number, lon: number) => void;
  geoJson: any;
  setGeoJson: (data: any) => void;
  setLocationName?: (name: string) => void;
}) {
  // Default center (India)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [flyToPosition, setFlyToPosition] = useState<[number, number] | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const defaultZoom = 5;
  const detailedZoom = 16;

  // Handle location detection
  const handleLocationDetected = (lat: number, lon: number) => {
    setFlyToPosition([lat, lon]);
    setIsInitializing(false);
  };

  // Once initialized, user can click on the map
  useEffect(() => {
    // Auto-initialize after a short delay to show the UI
    const timer = setTimeout(() => {
      if (flyToPosition === null) {
        setIsInitializing(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [flyToPosition]);

  // Extract polygon coordinates if geoJson is present
  // For MultiPolygon: coordinates[0] = first polygon, coordinates[0][0] = exterior ring
  const polygonPositions = geoJson?.coordinates?.[0]?.[0]?.map(
    (coord: number[]) => [coord[1], coord[0]] as [number, number]
  ) || geoJson?.coordinates?.[0]?.map(
    (coord: number[]) => [coord[1], coord[0]] as [number, number]
  );

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Smooth flyTo animation when location is detected */}
        <MapFlyTo center={flyToPosition} zoom={detailedZoom} />

        <ClickHandler onMapClick={onMapClick} />

        {/* Render farm boundary polygon if available */}
        {polygonPositions && (
          <Polygon
            positions={polygonPositions}
            pathOptions={{ color: "#166534", fillColor: "#4ade80", fillOpacity: 0.5 }}
          />
        )}
      </MapContainer>

      {/* Location Detection Overlay */}
      <LocationDetectionOverlay
        onLocationDetected={handleLocationDetected}
        isInitializing={isInitializing}
        setLocationName={setLocationName}
      />
    </div>
  );
}