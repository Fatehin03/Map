🌍 WorldMapApp

An interactive world map web app built with React + Leaflet on the frontend and Node.js (Express) + SQLite on the backend. Supports real-time updates, user pins, routes, uploads, PWA features, and data export.


---

✨ Features

🗺️ Interactive World Map (Leaflet.js)

📍 Add, Edit, Delete Pins with descriptions

🖼️ Upload Images for locations

📡 Real-Time Sync using WebSockets

🧭 Route Planner between two points

📊 Export Data as GeoJSON

📱 Progressive Web App (offline support + installable)

👤 User Accounts (login, profile, pins)

🚀 API-ready for future mobile app integration



---

📂 Project Structure

WorldMapApp/
│── frontend/        # React + Leaflet app
│── backend/         # Node.js + Express + SQLite API
│── public/          # PWA static assets
│── package.json     # Root package manager
│── README.md        # Documentation


---

⚡ Installation & Setup

1. Clone the Repository

git clone https://github.com/your-username/WorldMapApp.git
cd WorldMapApp

2. Install Dependencies

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install

3. Run the App

# Start backend (port 5000)
cd backend && npm start

# Start frontend (port 3000)
cd ../frontend && npm start

Visit: http://localhost:3000 🌍


---

🛠️ Tech Stack

Frontend: React, Leaflet, TailwindCSS

Backend: Node.js, Express, SQLite

Realtime: Socket.IO

PWA: Service Workers, Manifest

Auth: JWT-based login & signup



---

🚀 Deployment

Local: Run frontend + backend as described above

Production:

Use Docker (see docker-compose.yml)

Or deploy separately to Vercel (frontend) + Render/Heroku (backend)




---

📌 Roadmap

[ ] Add advanced filters (by category/tags)

[ ] Replace SQLite with Postgres + PostGIS

[ ] Add map clustering for performance

[ ] Mobile app using React Native



---

🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you’d like to change.


---

📜 License

MIT License © 2025 Fatehin Alam

