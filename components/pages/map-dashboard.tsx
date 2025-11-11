"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { LeafletMap } from "@/components/dashboard/leaflet-map"
import { StationDetailModal } from "@/components/dashboard/station-detail-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MapDashboardProps {
  role: "guest" | "expert" | "admin"
  onNavigate: (page: "guest" | "expert" | "tune" | "evaluation" | "admin" | "users" | "data" | "preprocessing" | "map" | "regression") => void
  onLogout: () => void
}

// Mock data for Mekong River water stations
const mockStations = [
  {
    id: 1,
    name: "Jinghong",
    lat: 22.02,
    lng: 100.79,
    waterLevel: 3.21,
    status: 'normal' as const
  },
  {
    id: 2,
    name: "Chiang Saen",
    lat: 20.27,
    lng: 100.08,
    waterLevel: 3.52,
    status: 'normal' as const
  },
  {
    id: 3,
    name: "Luang Prabang",
    lat: 19.88,
    lng: 102.14,
    waterLevel: 4.12,
    status: 'warning' as const
  },
  {
    id: 4,
    name: "Vientiane",
    lat: 17.97,
    lng: 102.61,
    waterLevel: 3.85,
    status: 'normal' as const
  },
  {
    id: 5,
    name: "Pakse",
    lat: 15.12,
    lng: 105.80,
    waterLevel: 5.21,
    status: 'critical' as const
  },
  {
    id: 6,
    name: "Stung Treng",
    lat: 13.57,
    lng: 105.97,
    waterLevel: 4.85,
    status: 'warning' as const
  },
  {
    id: 7,
    name: "Kratie",
    lat: 12.49,
    lng: 106.02,
    waterLevel: 4.52,
    status: 'warning' as const
  },
  {
    id: 8,
    name: "Tan Chau",
    lat: 10.78,
    lng: 105.24,
    waterLevel: 2.85,
    status: 'normal' as const
  },
  {
    id: 9,
    name: "Châu Đốc",
    lat: 10.70,
    lng: 105.05,
    waterLevel: 2.68,
    status: 'normal' as const
  }
]

export function MapDashboard({ role, onNavigate, onLogout }: MapDashboardProps) {
  const [selectedStation, setSelectedStation] = useState<typeof mockStations[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stations, setStations] = useState(mockStations)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Auto-refresh data every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time data update
      const updatedStations = stations.map(station => ({
        ...station,
        waterLevel: Number((station.waterLevel + (Math.random() - 0.5) * 0.1).toFixed(2))
      }))
      setStations(updatedStations)
      setLastUpdate(new Date())
      console.log('Data refreshed at:', new Date().toLocaleTimeString())
    }, 15 * 60 * 1000) // 15 minutes

    return () => clearInterval(interval)
  }, [stations])

  const handleStationClick = (station: typeof mockStations[0]) => {
    setSelectedStation(station)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStation(null)
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar
        currentPage="map"
        role={role}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Water Station Map" role={role} />
         
        {/* Station Detail Modal */}
        <StationDetailModal
          station={selectedStation}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
        <main className="flex-1 overflow-auto p-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Water Monitoring Stations</CardTitle>
                <span className="text-xs text-slate-400">
                  Last update: {lastUpdate.toLocaleTimeString('en-GB')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <LeafletMap 
                stations={stations} 
                onStationClick={handleStationClick}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Station Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stations.map((station) => (
                  <div 
                    key={station.id} 
                    className="p-4 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => handleStationClick(station)}
                  >
                    <h3 className="font-semibold text-white text-sm">{station.name}</h3>
                    <p className="text-slate-300 text-xs mt-1">
                      Level: {station.waterLevel}m
                    </p>
                    <span 
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        station.status === 'critical' ? 'bg-red-600 text-white' :
                        station.status === 'warning' ? 'bg-yellow-600 text-white' :
                        'bg-green-600 text-white'
                      }`}
                    >
                      {station.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
       
      </div>
    </div>
  )
}