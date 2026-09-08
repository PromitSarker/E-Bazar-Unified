'use client'

import { useEffect, useRef, useState } from 'react'

interface LocationPickerProps {
  initialLat?: number
  initialLng?: number
  onLocationChange: (lat: number, lng: number, address?: string) => void
}

export default function LocationPicker({ initialLat, initialLng, onLocationChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [address, setAddress] = useState<string>('')
  const [geocoding, setGeocoding] = useState(false)

  const defaultLat = initialLat ?? 23.8103
  const defaultLng = initialLng ?? 90.4125

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    // Dynamically import Leaflet (client-only)
    import('leaflet').then(L => {
      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView([defaultLat, defaultLng], 14)
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map)
      markerRef.current = marker

      const handleMove = async (lat: number, lng: number) => {
        setGeocoding(true)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          )
          const data = await res.json()
          const addr = data.display_name ?? ''
          setAddress(addr)
          onLocationChange(lat, lng, addr)
        } catch {
          onLocationChange(lat, lng)
        } finally {
          setGeocoding(false)
        }
      }

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng()
        handleMove(lat, lng)
      })

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng)
        handleMove(e.latlng.lat, e.latlng.lng)
      })

      // Initial reverse geocode if coordinates provided
      if (initialLat && initialLng) {
        handleMove(initialLat, initialLng)
      }
    })

    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        mapInstance.current?.setView([latitude, longitude], 16)
        markerRef.current?.setLatLng([latitude, longitude])
        // Trigger reverse geocode
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          .then(r => r.json())
          .then(data => {
            const addr = data.display_name ?? ''
            setAddress(addr)
            onLocationChange(latitude, longitude, addr)
          })
          .catch(() => onLocationChange(latitude, longitude))
      },
      () => alert('Could not get your location. Please pin manually.')
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div ref={mapRef} style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }} />
        <button
          type="button"
          onClick={handleGeolocate}
          className="absolute top-3 right-3 z-[1000] bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          Use my location
        </button>
      </div>
      {geocoding && <p className="text-xs text-gray-400">Finding address…</p>}
      {address && !geocoding && (
        <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 line-clamp-2">
          📍 {address}
        </p>
      )}
      <p className="text-xs text-gray-400">Drag the pin or tap the map to set your exact location.</p>
    </div>
  )
}
