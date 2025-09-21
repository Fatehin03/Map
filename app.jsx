import React from 'react'
import MapView from './components/MapView'

export default function App(){
  return (
    <div className="app-root">
      <header className="topbar">WorldMapApp</header>
      <main>
        <MapView />
      </main>
    </div>
  )
}
