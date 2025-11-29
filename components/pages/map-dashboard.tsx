"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { LeafletMap } from "@/components/dashboard/leaflet-map"
import { StationDetailModal } from "@/components/dashboard/station-detail-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStations, Station } from "@/app/actions/station-actions"

interface MapDashboardProps {
  role: "guest" | "expert" | "admin"
  onNavigate: (page: "guest" | "expert" | "tune" | "evaluation" | "admin" | "users" | "data" | "preprocessing" | "map" | "regression") => void
  onLogout: () => void
}

export function MapDashboard({ role, onNavigate, onLogout }: MapDashboardProps) {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    fetchStations()
    const interval = setInterval(() => {
      fetchStations()
    }, 15 * 60 * 1000) // 15 minutes

    return () => clearInterval(interval)
  }, [])

  const fetchStations = async () => {
    try {
      const data = await getStations()
      setStations(data)
      setLastUpdate(new Date())
      console.log('Data refreshed at:', new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Error fetching stations:", error)
    }
  }

  const handleStationClick = (station: Station) => {
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
                      Level: {station.waterLevel.toFixed(2)}m
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