"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Import CSS for Leaflet
import 'leaflet/dist/leaflet.css'

// Dynamic imports to avoid SSR issues with ssr: false
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-slate-800 rounded-lg flex items-center justify-center"><div className="text-slate-400">Loading map...</div></div>
})

const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const WMSTileLayer = dynamic(() => import('react-leaflet').then(mod => mod.WMSTileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface WaterStation {
  id: number
  name: string
  lat: number
  lng: number
  waterLevel: number
  status: 'normal' | 'warning' | 'critical'
}

interface LeafletMapProps {
  stations: WaterStation[]
  onStationClick?: (station: WaterStation) => void
}

export function LeafletMap({ stations, onStationClick }: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Fix for Leaflet icon in Next.js
    if (typeof window !== 'undefined') {
      const L = require('leaflet')
      delete (L.Icon.Default.prototype as any)._getIconUrl
      
      // Custom green icon for Mekong stations
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
  }, [])

  if (!isClient) {
    return (
      <div className="w-full h-[500px] bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-slate-400">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden">
      <MapContainer
        center={[16.0, 104.0]} // Center on Mekong region
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        {/* Google Maps Satellite Hybrid Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
        />
        
        {/* Mekong River WMS Layer from GeoServer */}
        <WMSTileLayer
          url="http://103.77.166.185:8080/geoserver/ne/wms"
          params={{
            layers: 'ne:mekong_river',
            format: 'image/png',
            transparent: true,
            version: '1.1.0',
          }}
          attribution='&copy; <a href="http://103.77.166.185:8080/geoserver">GeoServer</a>'
        />
        
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            eventHandlers={{
              click: () => onStationClick?.(station)
            }}
          >
            
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}