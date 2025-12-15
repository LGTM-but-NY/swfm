// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const API_BASE = 'https://mkmonitoring.siwrr.io.vn/api/v1/data/get-monitoring-station'

interface ApiResponse {
  statusCode: number
  message: string
  data: {
    id: number
    featched_UTC: string
    stationCode: string
    stationName: string
    country: string
    river: string
    date: string
    lastedWaterLevelM: string | null
    rain_1h_mm: string | null
    rain_6h_mm: string | null
    rain_12h_mm: string | null
    rain_24h_mm: string | null
    rain_7to7_mm: string | null
    alarm_level_m: string | null
    flood_level_m: string | null
  }
}

/**
 * Parse the API date format "Dec2,2025 3:30:00AM" to ISO timestamp
 * The API uses a non-standard format that needs careful parsing
 */
function parseApiDate(dateStr: string): Date | null {
  try {
    // Handle "Dec2,2025 3:30:00AM" format
    // Transform to "Dec 2, 2025 3:30:00 AM" which JS Date can parse
    const normalized = dateStr
      .replace(/(\w{3})(\d+),(\d{4})/, '$1 $2, $3')  // Dec2,2025 -> Dec 2, 2025
      .replace(/(\d+)(AM|PM)/i, '$1 $2')              // 3:30:00AM -> 3:30:00 AM
    
    const date = new Date(normalized)
    
    if (isNaN(date.getTime())) {
      console.error(`Failed to parse date: ${dateStr} -> ${normalized}`)
      return null
    }
    
    return date
  } catch (e) {
    console.error(`Error parsing date ${dateStr}:`, e)
    return null
  }
}

/**
 * Convert string value to number, handling null and empty strings
 */
function toNumber(val: string | null): number | null {
  if (val === null || val === '' || val === 'null') return null
  const num = parseFloat(val)
  return isNaN(num) ? null : num
}

/**
 * Main handler for the Edge Function
 * Fetches water level data from external API for all active stations
 * and upserts into the measurements table
 */
serve(async (req: Request) => {
  try {
    // Create Supabase client with service role key for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all active stations
    const { data: stations, error: stationsError } = await supabase
      .from('stations')
      .select('id, station_code, name')
      .eq('is_deleted', false)

    if (stationsError) {
      console.error('Error fetching stations:', stationsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch stations', details: stationsError.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!stations || stations.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No active stations found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Starting sync for ${stations.length} stations...`)

    const results: Array<{ station: string; success: boolean }> = []
    const errors: Array<{ station: string; error: string }> = []

    // Process each station sequentially to avoid rate limiting
    for (const station of stations) {
      try {
        console.log(`Fetching data for station: ${station.name} (${station.station_code})`)
        
        const response = await fetch(`${API_BASE}/${station.station_code}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SWFM-Sync/1.0'
          }
        })
        
        if (!response.ok) {
          errors.push({ 
            station: station.station_code, 
            error: `HTTP ${response.status}: ${response.statusText}` 
          })
          continue
        }

        const json: ApiResponse = await response.json()

        if (json.statusCode !== 200) {
          errors.push({ station: station.station_code, error: json.message })
          continue
        }

        const { data } = json
        
        if (!data) {
          errors.push({ station: station.station_code, error: 'No data returned from API' })
          continue
        }
        
        const measuredAt = parseApiDate(data.date)
        
        if (!measuredAt) {
          errors.push({ station: station.station_code, error: `Invalid date format: ${data.date}` })
          continue
        }

        // Insert measurement (ignore if same station_id + measured_at already exists)
        const { error: upsertError } = await supabase
          .from('station_measurements')
          .insert({
            station_id: station.id,
            measured_at: measuredAt.toISOString(),
            water_level: toNumber(data.lastedWaterLevelM),
            rainfall_1h: toNumber(data.rain_1h_mm),
            rainfall_6h: toNumber(data.rain_6h_mm),
            rainfall_12h: toNumber(data.rain_12h_mm),
            rainfall_24h: toNumber(data.rain_24h_mm),
            rainfall_7to7: toNumber(data.rain_7to7_mm),
            fetched_at: data.featched_UTC,
            source: 'automated',
            status: 'verified'
          })
          .select()
          .maybeSingle()

        if (upsertError) {
          // Ignore duplicate key errors (measurement already exists)
          if (upsertError.message.includes('duplicate key') || 
              upsertError.message.includes('unique constraint')) {
            console.log(`⊘ Skipped duplicate: ${station.name}`)
            results.push({ station: station.station_code, success: true })
          } else {
            console.error(`Error inserting for ${station.station_code}:`, upsertError)
            errors.push({ station: station.station_code, error: upsertError.message })
          }
        } else {
          results.push({ station: station.station_code, success: true })
          console.log(`✓ Synced: ${station.name}`)
        }

        // Also update station's alarm/flood levels if provided by API
        if (data.alarm_level_m || data.flood_level_m) {
          await supabase
            .from('stations')
            .update({
              alarm_level: toNumber(data.alarm_level_m),
              flood_level: toNumber(data.flood_level_m),
              river: data.river || null
            })
            .eq('id', station.id)
        }

        // Small delay between requests to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (e) {
        console.error(`Exception for ${station.station_code}:`, e)
        errors.push({ station: station.station_code, error: String(e) })
      }
    }

    // Log sync result to sync_logs table
    const { error: logError } = await supabase.from('sync_logs').insert({
      synced_at: new Date().toISOString(),
      success_count: results.length,
      error_count: errors.length,
      details: { results, errors }
    })

    if (logError) {
      console.error('Failed to log sync result:', logError)
    }

    const summary = {
      message: 'Sync completed',
      success_count: results.length,
      error_count: errors.length,
      total_stations: stations.length,
      synced_at: new Date().toISOString()
    }

    console.log('Sync completed:', summary)

    return new Response(
      JSON.stringify({ 
        ...summary,
        details: { results, errors }
      }),
      { 
        status: errors.length > 0 && results.length === 0 ? 500 : 200,
        headers: { 'Content-Type': 'application/json' } 
      }
    )

  } catch (e) {
    console.error('Unexpected error in sync-measurements:', e)
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: String(e) }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
