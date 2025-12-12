"use server"

import { createClient } from "@/lib/supabase/server"

export interface DashboardMetrics {
  activeStations: number
  warningAlerts: number
  criticalAlerts: number
  avgWaterLevel: number | null
  rainfall24h: number | null
}

/**
 * Get aggregated dashboard metrics from the database
 * - Active stations count
 * - Warning alerts (stations at/above alarm level)
 * - Critical alerts (stations at/above flood level)
 * - Average water level across all stations
 * - Total rainfall in last 24 hours
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient()
  const excludedStationIds = '(0,1,7)'

  // Get latest measurements for each station (last 24 hours)
  const yesterday = new Date()
  yesterday.setHours(yesterday.getHours() - 24)
  
  const { data: recentMeasurements, error: measurementsError } = await supabase
    .from('station_measurements')
    .select('station_id, water_level, rainfall_24h')
    .gte('measured_at', yesterday.toISOString())
    .not('station_id', 'in', excludedStationIds)
    .order('measured_at', { ascending: false })
  
  if (measurementsError) {
    console.error('Error fetching measurements:', measurementsError)
  }

  // Alert counts (warning/critical) are computed client-side from station status
  // to stay consistent with map marker colors.
  const warningAlerts = 0
  const criticalAlerts = 0

  // Calculate average water level
  let avgWaterLevel: number | null = null
  if (recentMeasurements && recentMeasurements.length > 0) {
    const waterLevels = recentMeasurements
      .map(m => m.water_level)
      .filter((wl): wl is number => wl !== null)
    
    if (waterLevels.length > 0) {
      avgWaterLevel = Math.round(
        (waterLevels.reduce((sum, wl) => sum + wl, 0) / waterLevels.length) * 10
      ) / 10
    }
  }

  // Calculate total rainfall in last 24h (average across stations)
  let rainfall24h: number | null = null
  if (recentMeasurements && recentMeasurements.length > 0) {
    const rainfallValues = recentMeasurements
      .map(m => m.rainfall_24h)
      .filter((r): r is number => r !== null && r > 0)
    
    if (rainfallValues.length > 0) {
      rainfall24h = Math.round(
        rainfallValues.reduce((sum, r) => sum + r, 0) / rainfallValues.length
      )
    }
  }

  return {
    activeStations: 0,
    warningAlerts,
    criticalAlerts,
    avgWaterLevel,
    rainfall24h
  }
}
