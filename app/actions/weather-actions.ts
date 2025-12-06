"use server"

import { createClient } from "@/lib/supabase/server"

// Type for weather measurement data
export type WeatherData = {
  id: number
  station_id: number
  measured_at: string
  temperature: number | null
  temp_min: number | null
  temp_max: number | null
  feels_like: number | null
  pressure: number | null
  humidity: number | null
  wind_speed: number | null
  wind_deg: number | null
  rain_1h: number | null
  clouds: number | null
  visibility: number | null
  weather_main: string | null
  weather_description: string | null
}

/**
 * Get the latest weather measurement for a specific station
 */
export async function getLatestWeatherForStation(stationId: number): Promise<WeatherData | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('weather_measurements')
    .select('*')
    .eq('station_id', stationId)
    .order('measured_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // PGRST116 = No rows found
    if (error.code !== 'PGRST116') {
      console.error("Error fetching weather data:", error)
    }
    return null
  }

  return data as WeatherData
}

/**
 * Get weather history for a station over specified number of days
 */
export async function getWeatherHistory(stationId: number, days: number = 7): Promise<WeatherData[]> {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('weather_measurements')
    .select('*')
    .eq('station_id', stationId)
    .gte('measured_at', startDate.toISOString())
    .order('measured_at', { ascending: false })

  if (error) {
    console.error("Error fetching weather history:", error)
    return []
  }

  return (data as WeatherData[]) || []
}

