"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MapView } from "@/components/dashboard/map-view"
import { StationDataPanel } from "@/components/dashboard/station-data-panel"
import { ForecastChart } from "@/components/dashboard/forecast-chart"
import { ModelSelector } from "@/components/dashboard/model-selector"
import { AlertsBanner } from "@/components/dashboard/alerts-banner"

interface ExpertDashboardProps {
  role: "expert" | "admin"
  onNavigate: (page: "guest" | "expert" | "tune" | "evaluation" | "admin" | "users" | "data" | "preprocessing" | "map" | "regression") => void
  onLogout: () => void
}

export function ExpertDashboard({ role, onNavigate, onLogout }: ExpertDashboardProps) {
  const [selectedStation, setSelectedStation] = useState("Vientiane")
  const [selectedModel, setSelectedModel] = useState("hybrid")
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Auto-refresh data every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      console.log('Expert dashboard data refreshed at:', new Date().toLocaleTimeString())
    }, 15 * 60 * 1000) // 15 minutes

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="expert" role={role} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Expert Forecasting Dashboard" role={role} />

        <main className="flex-1 overflow-auto">
          <div className="px-6 pt-4 pb-2">
            <span className="text-xs text-slate-400">
              Last update: {lastUpdate.toLocaleTimeString('en-GB')} • Auto-refresh every 15 minutes
            </span>
          </div>
          <div className="p-6 space-y-6">
            <AlertsBanner />

            {/* Model Selection */}
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Monitoring Stations</CardTitle>
                    <CardDescription className="text-slate-400">
                      Select station to tune model parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MapView onStationSelect={setSelectedStation} />
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Forecast Comparison</CardTitle>
                    <CardDescription className="text-slate-400">
                      {selectedStation} - Model: {selectedModel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ForecastChart station={selectedStation} showMultiple={true} />
                  </CardContent>
                </Card>
              </div>

              <div>
                <StationDataPanel station={selectedStation} role={role} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
