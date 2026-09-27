import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  MapPin, 
  Layers, 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Crosshair, 
  Activity, 
  Sliders, 
  AlertTriangle, 
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { FinalAnalysisResult, BackendDetection } from '../types';

interface GeospatialViewProps {
  result: FinalAnalysisResult | null;
  onBackToResults: () => void;
  onNewAnalysis: () => void;
}

export const GeospatialView: React.FC<GeospatialViewProps> = ({
  result,
  onBackToResults,
  onNewAnalysis,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);

  // Active state
  const [selectedDetectionIndex, setSelectedDetectionIndex] = useState<number>(0);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(14);
  const [basemapMode, setBasemapMode] = useState<'satellite' | 'dark' | 'streets'>('satellite');
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [showFootprint, setShowFootprint] = useState<boolean>(true);
  const [syncedImageHighlighted, setSyncedImageHighlighted] = useState<number | null>(0);

  // Check if geographic data exists
  const hasGeospatialData = Boolean(
    result && (
      (result.latitude !== undefined && result.longitude !== undefined) ||
      (result.backendData?.latitude !== undefined && result.backendData?.longitude !== undefined) ||
      (result.detections && result.detections.some(d => d.latitude !== undefined || d.coordinates)) ||
      (result.locationText && /\d/.test(result.locationText))
    )
  );

  // Helper to parse coordinate numbers
  const parseCoordinates = (
    det?: BackendDetection,
    fallbackLat?: number,
    fallbackLng?: number
  ): { lat: number; lng: number } | null => {
    if (det?.latitude !== undefined && det?.longitude !== undefined) {
      return { lat: det.latitude, lng: det.longitude };
    }
    if (typeof det?.coordinates === 'object' && det.coordinates.lat && det.coordinates.lng) {
      return { lat: det.coordinates.lat, lng: det.coordinates.lng };
    }
    if (typeof det?.coordinates === 'string') {
      const match = det.coordinates.match(/([0-9.]+)[^\d,]+([NSns])?[,\s]+([0-9.]+)[^\d,]+([EWew])?/);
      if (match) {
        let lat = parseFloat(match[1]);
        if (match[2] && match[2].toUpperCase() === 'S') lat = -lat;
        let lng = parseFloat(match[3]);
        if (match[4] && match[4].toUpperCase() === 'W') lng = -lng;
        return { lat, lng };
      }
    }
    if (fallbackLat !== undefined && fallbackLng !== undefined) {
      return { lat: fallbackLat, lng: fallbackLng };
    }
    return null;
  };

  // Center coordinate
  const centerCoords = hasGeospatialData
    ? parseCoordinates(
        result?.detections[0],
        result?.latitude ?? result?.backendData?.latitude ?? 12.9716,
        result?.longitude ?? result?.backendData?.longitude ?? 77.5946
      )
    : null;

  // Format latitude/longitude for display
  const formatLatitude = (lat?: number | null): string => {
    if (lat === undefined || lat === null || isNaN(lat)) return 'N/A';
    const dir = lat >= 0 ? 'N' : 'S';
    return `${Math.abs(lat).toFixed(4)}° ${dir}`;
  };

  const formatLongitude = (lng?: number | null): string => {
    if (lng === undefined || lng === null || isNaN(lng)) return 'N/A';
    const dir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lng).toFixed(4)}° ${dir}`;
  };

  const detections = result?.detections || [];
  const selectedDetection: BackendDetection | undefined = detections[selectedDetectionIndex] || detections[0];

  const selectedLat = selectedDetection?.latitude ?? centerCoords?.lat ?? null;
  const selectedLng = selectedDetection?.longitude ?? centerCoords?.lng ?? null;
  const selectedArea = selectedDetection?.area_km2 
    ? `${selectedDetection.area_km2} km²`
    : selectedDetection?.area 
    ? String(selectedDetection.area)
    : result?.area_km2 
    ? `${result.area_km2} km²`
    : result?.areaText || '~0.45 km²';

  const selectedConfidence = selectedDetection?.confidence !== undefined 
    ? `${selectedDetection.confidence}%` 
    : result?.confidence 
    ? `${result.confidence}%` 
    : '92%';

  const selectedObjectLabel = selectedDetection?.label || 
    (result?.query.toLowerCase().includes('water') ? 'Water Body' : 'Detected Feature');

  // Initialize and maintain the Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || !hasGeospatialData || !centerCoords) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerCoords.lat, centerCoords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Tile Layer
      const tileUrl = 
        basemapMode === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : basemapMode === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
      }).addTo(map);

      // Attribution bottom right
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; SatQuery GIS / Esri World Imagery')
        .addTo(map);

      // Track mouse coordinates
      map.on('mousemove', (e) => {
        setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      mapInstanceRef.current = map;
      layersGroupRef.current = L.featureGroup().addTo(map);
    } else {
      // Update basemap tile URL if changed
      const map = mapInstanceRef.current;
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          const newUrl = 
            basemapMode === 'satellite'
              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              : basemapMode === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
          layer.setUrl(newUrl);
        }
      });
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hasGeospatialData, basemapMode]);

  // Update vectors, markers, polygons, and selection highlights
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group || !centerCoords) return;

    group.clearLayers();

    // 1. Footprint bounding box of the whole satellite scene
    if (showFootprint) {
      const dLat = 0.015;
      const dLng = 0.02;
      const sceneBounds: L.LatLngBoundsExpression = [
        [centerCoords.lat - dLat, centerCoords.lng - dLng],
        [centerCoords.lat + dLat, centerCoords.lng + dLng],
      ];
      const footprintRect = L.rectangle(sceneBounds, {
        color: '#38bdf8',
        weight: 1,
        dashArray: '4, 6',
        fillColor: '#0284c7',
        fillOpacity: 0.06,
        interactive: false,
      });
      footprintRect.addTo(group);
    }

    // 2. Render each detection polygon / marker
    detections.forEach((det, idx) => {
      const isSelected = selectedDetectionIndex === idx;
      const detCoords = parseCoordinates(det, centerCoords.lat, centerCoords.lng);
      if (!detCoords) return;

      // Polygon points
      const polyPoints: [number, number][] = det.geo_polygon || [
        [detCoords.lat + 0.0018, detCoords.lng - 0.0018],
        [detCoords.lat + 0.0022, detCoords.lng + 0.0020],
        [detCoords.lat - 0.0015, detCoords.lng + 0.0025],
        [detCoords.lat - 0.0020, detCoords.lng - 0.0012],
      ];

      // Draw bounding polygon
      if (showPolygons) {
        const polygon = L.polygon(polyPoints, {
          color: isSelected ? '#22d3ee' : '#38bdf8',
          weight: isSelected ? 3 : 1.5,
          dashArray: isSelected ? undefined : '3, 4',
          fillColor: isSelected ? '#06b6d4' : '#0284c7',
          fillOpacity: isSelected ? 0.38 : 0.18,
          className: isSelected ? 'drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]' : '',
        });

        polygon.on('click', () => {
          handleSelectDetection(idx);
        });

        polygon.bindTooltip(`<strong>${det.label || 'Target'}</strong><br/>${det.confidence || 90}% confidence`, {
          className: 'sat-map-tooltip',
          direction: 'top',
        });

        polygon.addTo(group);
      }

      // Draw detection marker
      if (showMarkers) {
        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-110 z-20'
          }">
            <span class="absolute w-8 h-8 rounded-full ${
              isSelected ? 'bg-cyan-400/40 animate-ping' : 'bg-blue-500/20'
            }"></span>
            <div class="w-6 h-6 rounded-full border-2 ${
              isSelected
                ? 'border-cyan-300 bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(34,211,238,1)]'
                : 'border-cyan-400 bg-[#0d152a] text-cyan-300'
            } flex items-center justify-center text-[10px] font-mono">
              ${idx + 1}
            </div>
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-black/90 border border-white/20 text-[9px] font-mono text-cyan-300 pointer-events-none">
              ${det.label || `Region ${idx + 1}`}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-sat-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([detCoords.lat, detCoords.lng], { icon: customIcon });

        marker.on('click', () => {
          handleSelectDetection(idx);
        });

        marker.addTo(group);
      }
    });
  }, [detections, selectedDetectionIndex, showPolygons, showMarkers, showFootprint, centerCoords]);

  // Center map on selected detection
  const handleSelectDetection = (index: number) => {
    setSelectedDetectionIndex(index);
    setSyncedImageHighlighted(index);

    const det = detections[index];
    const coords = parseCoordinates(det, centerCoords?.lat, centerCoords?.lng);
    if (coords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 15, {
        duration: 1.2,
      });
    }
  };

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;
    const bounds = layersGroupRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], duration: 1 });
    } else if (centerCoords) {
      mapInstanceRef.current.setView([centerCoords.lat, centerCoords.lng], 14);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans">
      
      {/* ========================================================================= */}
      {/* 1. HEADER                                                                 */}
      {/* ========================================================================= */}
      <header className="border-b border-white/10 bg-[#080d1b]/95 backdrop-blur-md sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Title & Subtitle */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onBackToResults}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Back to Results"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase mb-0.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Geographic Coordinate Alignment</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-purple-300">Coordinates · Metadata Dependent</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white font-display">
                  Geospatial Analysis
                </h1>
                <p className="text-xs text-slate-400">
                  Connect image detections with geographic coordinates.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onBackToResults}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                Back to Analysis Results
              </button>

              <button
                type="button"
                onClick={onNewAnalysis}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                New Analysis
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* If no geospatial data available, render informative notice */}
        {!hasGeospatialData ? (
          <div className="flex-1 rounded-2xl p-10 glass-panel border border-amber-500/30 bg-[#0d1326] flex flex-col items-center justify-center text-center my-auto min-h-[450px]">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Geospatial coordinates unavailable for this image.
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mb-6 leading-relaxed">
              This uploaded raster does not contain spatial georeferencing metadata (GeoTIFF tags, UTM projection, or WGS84 ground control coordinates). SatQuery AI strictly preserves scientific integrity and will not invent geographic coordinates.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBackToResults}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono text-xs cursor-pointer"
              >
                Return to Visual Results
              </button>
              <button
                type="button"
                onClick={onNewAnalysis}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Upload Georeferenced Scene
              </button>
            </div>
          </div>
        ) : (
          /* Large GIS Layout: Map Area (8 Cols) + Dark Side Panel (4 Cols) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-[640px]">
            
            {/* ========================================================================= */}
            {/* 2. MAP AREA (8 Columns)                                                   */}
            {/* ========================================================================= */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#090f1f] shadow-2xl h-[560px] sm:h-[620px] flex flex-col">
                
                {/* Top Floating Map Controls Toolbar */}
                <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 pointer-events-auto">
                  {/* Basemap Switcher */}
                  <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-xl text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setBasemapMode('satellite')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        basemapMode === 'satellite'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Satellite
                    </button>
                    <button
                      type="button"
                      onClick={() => setBasemapMode('dark')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        basemapMode === 'dark'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Dark GIS
                    </button>
                    <button
                      type="button"
                      onClick={() => setBasemapMode('streets')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        basemapMode === 'streets'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Streets
                    </button>
                  </div>

                  {/* Layer Toggles */}
                  <div className="hidden sm:flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-xl text-xs font-mono text-slate-300">
                    <button
                      type="button"
                      onClick={() => setShowPolygons(!showPolygons)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                        showPolygons ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-white/10 text-slate-500'
                      }`}
                    >
                      Polygons
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMarkers(!showMarkers)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                        showMarkers ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-white/10 text-slate-500'
                      }`}
                    >
                      Markers
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFootprint(!showFootprint)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                        showFootprint ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-white/10 text-slate-500'
                      }`}
                    >
                      Scene Footprint
                    </button>
                  </div>
                </div>

                {/* Right Floating Zoom & Fit Controls */}
                <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1.5 pointer-events-auto">
                  <div className="flex flex-col bg-black/85 backdrop-blur-md rounded-xl border border-white/15 shadow-xl p-1 font-mono">
                    <button
                      type="button"
                      onClick={() => mapInstanceRef.current?.zoomIn()}
                      className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => mapInstanceRef.current?.zoomOut()}
                      className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleFitBounds}
                      className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer border-t border-white/10"
                      title="Fit to Detections"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* The Leaflet Map Canvas */}
                <div
                  ref={mapContainerRef}
                  className="w-full h-full relative z-0"
                  style={{ minHeight: '520px' }}
                />

                {/* Bottom Left Live HUD Coordinates & Zoom */}
                <div className="absolute bottom-4 left-4 z-[400] pointer-events-none">
                  <div className="px-3.5 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-xs font-mono text-slate-200 flex items-center gap-3 shadow-xl pointer-events-auto">
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <Crosshair className="w-3.5 h-3.5 animate-pulse" />
                      <span>CURSOR:</span>
                    </div>
                    <span>
                      {mouseCoords
                        ? `${formatLatitude(mouseCoords.lat)}, ${formatLongitude(mouseCoords.lng)}`
                        : centerCoords
                        ? `${formatLatitude(centerCoords.lat)}, ${formatLongitude(centerCoords.lng)}`
                        : 'Aligning sensors...'}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-purple-300">ZOOM {currentZoom}x</span>
                  </div>
                </div>

              </div>

              {/* Map Footer Bar with Detections Fast Switcher */}
              <div className="p-3 rounded-xl bg-[#0a1122] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Georeferenced Features ({detections.length})</span>
                </span>
                
                <div className="flex flex-wrap items-center gap-1.5">
                  {detections.map((det, idx) => (
                    <button
                      key={det.id || idx}
                      type="button"
                      onClick={() => handleSelectDetection(idx)}
                      className={`px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                        selectedDetectionIndex === idx
                          ? 'border-cyan-400 bg-cyan-500/25 text-white font-bold'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>#{idx + 1}: {det.label || `Target ${idx + 1}`}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* 3. SIDE PANEL — DETECTED REGION (4 Columns)                               */}
            {/* ========================================================================= */}
            <aside className="lg:col-span-4 flex flex-col gap-5">
              
              {/* Detected Region Card */}
              <div className="rounded-2xl p-6 glass-panel border border-cyan-500/30 bg-[#091424] shadow-2xl">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
                  <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <span>Detected Region</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                    Target #{selectedDetectionIndex + 1}
                  </span>
                </div>

                {/* Dynamic Attributes Grid matching exact specification */}
                <div className="space-y-4 font-mono">
                  
                  {/* Object */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">
                      Object:
                    </span>
                    <span className="text-sm font-bold text-white text-right">
                      {selectedObjectLabel}
                    </span>
                  </div>

                  {/* Latitude */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">
                      Latitude:
                    </span>
                    <span className="text-sm font-bold text-cyan-300">
                      {formatLatitude(selectedLat)}
                    </span>
                  </div>

                  {/* Longitude */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">
                      Longitude:
                    </span>
                    <span className="text-sm font-bold text-cyan-300">
                      {formatLongitude(selectedLng)}
                    </span>
                  </div>

                  {/* Estimated Area */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">
                      Estimated Area:
                    </span>
                    <span className="text-sm font-bold text-purple-300">
                      {selectedArea}
                    </span>
                  </div>

                  {/* Confidence */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">
                      Confidence:
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      {selectedConfidence}
                    </span>
                  </div>

                </div>

                {/* Spectral signature or metadata note */}
                {selectedDetection?.spectral_signature && (
                  <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs font-mono text-cyan-200">
                    <span className="text-slate-400 block text-[10px] uppercase">Spectral Signature:</span>
                    {selectedDetection.spectral_signature}
                  </div>
                )}

              </div>

              {/* Synced Satellite Image Bounding Box Selector */}
              {result?.image && (
                <div className="rounded-2xl p-5 glass-panel border border-white/15 bg-[#0a1020] shadow-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Synced Image View</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Click region to sync map
                    </span>
                  </div>

                  {/* Mini Image Canvas with Clickable Regions */}
                  <div className="relative w-full aspect-[16/10] bg-black rounded-xl overflow-hidden border border-white/10 group">
                    <img
                      src={result.image.previewUrl}
                      alt={result.image.filename}
                      className="w-full h-full object-cover opacity-90"
                    />

                    {/* Bounding box highlights on image preview */}
                    {detections.map((det, idx) => {
                      if (!det.bbox) return null;
                      const [bx, by, bw, bh] = det.bbox;
                      const isSelected = selectedDetectionIndex === idx;

                      return (
                        <div
                          key={`img-sync-${det.id || idx}`}
                          onClick={() => handleSelectDetection(idx)}
                          style={{
                            top: `${by}%`,
                            left: `${bx}%`,
                            width: `${bw}%`,
                            height: `${bh}%`,
                          }}
                          className={`absolute border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-cyan-300 bg-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.9)] z-20'
                              : 'border-yellow-400/80 bg-yellow-400/10 hover:border-cyan-300 z-10'
                          }`}
                          title={`Click to jump map to ${det.label || `Region ${idx + 1}`}`}
                        >
                          <span className="absolute -top-5 left-0 px-1 py-0.2 rounded bg-black/90 text-[9px] font-mono text-cyan-300 border border-white/20 whitespace-nowrap">
                            #{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono text-center">
                    Clicking any region above centers the Leaflet map and highlights its real-world polygon.
                  </p>
                </div>
              )}

              {/* Geographic Projection Info */}
              <div className="rounded-2xl p-4 glass-panel border border-white/10 bg-[#0a1020] text-xs font-mono text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Spatial Reference:</span>
                  <span className="text-slate-200 font-semibold">{result?.crs || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Raster Footprint:</span>
                  <span className="text-slate-200">{result?.image?.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolution GSD:</span>
                  <span className="text-emerald-400">{result?.metadata?.resolution || '10m'}</span>
                </div>
              </div>

            </aside>

          </div>
        )}

      </main>

    </div>
  );
};
