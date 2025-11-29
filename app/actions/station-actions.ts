"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Station {
  id: number
  name: string
  lat: number
  lon: number
  country: string
  waterLevel: number
  status: 'normal' | 'warning' | 'critical'
}

export async function getStations(): Promise<Station[]> {
  const supabase = await createClient()
  
  const { data: stations, error } = await supabase
    .from('stations')
    .select(`
      id,
      name,
      latitude,
      longitude,
      country
    `)
    .order('name')

  if (error) {
    console.error("Error fetching stations:", error)
    return []
  }

  // Fetch latest measurement for each station to determine status
  const stationsWithStatus = await Promise.all(stations.map(async (station) => {
    const { data: measurement } = await supabase
      .from('measurements')
      .select('water_level')
      .eq('station_id', station.id)
      .order('measured_at', { ascending: false })
      .limit(1)
      .single()

    const waterLevel = measurement?.water_level || 0
    let status: 'normal' | 'warning' | 'critical' = 'normal'

    if (waterLevel > 4.5) status = 'critical'
    else if (waterLevel > 3.5) status = 'warning'

    return {
      ...station,
      lat: station.latitude,
      lon: station.longitude,
      country: station.country ?? '',
      waterLevel,
      status
    }
  }))

  return stationsWithStatus
}

export async function getStationStatus(stationId: number) {
  const supabase = await createClient()
  
  const { data: measurement } = await supabase
    .from('measurements')
    .select('water_level')
    .eq('station_id', stationId)
    .order('measured_at', { ascending: false })
    .limit(1)
    .single()

  return measurement?.water_level || 0
}
