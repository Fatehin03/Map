import React, {useEffect, useRef, useState} from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import axios from 'axios'
import { io } from 'socket.io-client'

const API = import.meta.env.VITE_API || 'http://localhost:4000'
const SOCKET = import.meta.env.VITE_SOCKET || 'http://localhost:4000'

export default function MapView(){
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const [markers, setMarkers] = useState([])
  const socketRef = useRef(null)

  useEffect(()=>{
    // init socket
    socketRef.current = io(SOCKET)
    socketRef.current.on('marker:created', m => {
      // add to map or update state
      setMarkers(prev => [...prev, m])
    })

    // init map
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0,20],
      zoom: 2
    })

    const map = mapRef.current

    // controls
    map.addControl(new maplibregl.NavigationControl())

    // draw
    const draw = new MapboxDraw({ displayControlsDefault: false, controls: { polygon: true, trash: true } })
    map.addControl(draw)

    // load markers from server
    const loadMarkers = async ()=>{
      const res = await axios.get(`${API}/markers`)
      setMarkers(res.data)
    }
    loadMarkers()

    // when map loads, add sources & layers
    map.on('load', ()=>{
      // add marker source for clustering
      map.addSource('markers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      })

      // cluster layers
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'markers',
        filter: ['has', 'point_count'],
        paint: {
          'circle-radius': ['step', ['get', 'point_count'], 15, 100, 20, 750, 25]
        }
      })
      map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'markers', filter:['has','point_count'], layout: { 'text-field':['get','point_count'], 'text-size':12 } })

      // unclustered point
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'markers',
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-radius': 6 }
      })

      // heatmap layer (sample) - created from same source
      map.addLayer({ id: 'heat', type: 'heatmap', source: 'markers', maxzoom: 15, paint: { 'heatmap-weight': ['interpolate', ['linear'], ['get','weight'], 0, 0, 6, 1], 'heatmap-intensity': 1 } }, 'unclustered-point')

      // sync markers to source
      map.getSource('markers').setData({ type:'FeatureCollection', features: markers.map(m => ({ type:'Feature', properties:{ id:m.id, title:m.title }, geometry: { type:'Point', coordinates: [m.lng, m.lat] } })) })
    })

    // click to add a temp marker
    map.on('click', async (e)=>{
      const title = prompt('Marker title:')
      if(!title) return
      const payload = { title, lat: e.lngLat.lat, lng: e.lngLat.lng }
      const res = await axios.post(`${API}/markers`, payload)
      // server will broadcast new marker via socket; optional manual add
      // setMarkers(prev => [...prev, res.data])
    })

    // cleanup
    return ()=>{ map.remove(); socketRef.current.disconnect(); }
  }, [])

  // update map source whenever markers state changes
  useEffect(()=>{
    if(!mapRef.current || !mapRef.current.getSource) return
    const src = mapRef.current.getSource('markers')
    if(src) src.setData({ type:'FeatureCollection', features: markers.map(m => ({ type:'Feature', properties:{ id:m.id, title:m.title, weight:1 }, geometry:{ type:'Point', coordinates:[m.lng, m.lat] } })) })
  }, [markers])

  // simple search
  async function doSearch(q){
    if(!q) return
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`
    const res = await axios.get(url, { headers:{ 'Accept-Language':'en' } })
    if(res.data.length) {
      const first = res.data[0]
      mapRef.current.flyTo({ center:[first.lon, first.lat], zoom:12 })
    } else alert('No results')
  }

  // routing via OSRM
  async function route(from, to){
    // from/to are [lng,lat]
    const url = `https://router.project-osrm.org/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`
    const res = await axios.get(url)
    if(res.data && res.data.routes && res.data.routes[0]){
      const geom = res.data.routes[0].geometry
      // remove previous
      if(mapRef.current.getSource('route')) mapRef.current.removeLayer('route-line') & mapRef.current.removeSource('route')
      mapRef.current.addSource('route', { type:'geojson', data: geom })
      mapRef.current.addLayer({ id:'route-line', type:'line', source:'route', paint:{ 'line-width':4 } })
    }
  }

  return (
    <div style={{height:'100vh', display:'flex'}}>
      <div style={{width: '100%'}} ref={mapContainer}></div>
      <div style={{position:'absolute', left:10, top:40, zIndex:1000}}>
        <input placeholder="Search place" id="searchbox" />
        <button onClick={()=>doSearch(document.getElementById('searchbox').value)}>Search</button>
      </div>
    </div>
  )
                                                                                                              }
