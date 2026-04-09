💬 connectify — Real-Time Chat Application
A full-featured real-time chat application built for seamless, instant communication.
🚀 Tech Stack
LayerTechnology
FrontendReact.js + Vite + Tailwind CSS
BackendNode.js + Express.jsDatabaseMongoDB (Mongoose)
Real-TimeSocket.IOAuthJWT (JSON Web Tokens)
StylingCustom theme + Modern UI
<img width="740" height="1220" alt="image" src="https://github.com/user-attachments/assets/5758358b-c7ed-4cbc-a849-4b1d5c87762d" />

⚙️ Setup & Installation
Prerequisites

Node.js v18+
MongoDB running locally (or MongoDB Atlas URI)

1. Clone the repository
bash
git clone https://github.com/your-username/daft-connect.git
cd daft-connect
2. Setup Backend
bashcd server
npm install
Edit server/.env:
envPORT=5000
MONGO_URI=mongodb://localhost:27017/daft_connect_db
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
Start the server:
bashnpm start
# or for development with auto-reload:
npm run dev
3. Setup Frontend
bashcd client
npm install
npm run dev
The app runs at http://localhost:3000
🌐 Pages
Route            Description
/                Landing / Login page
/register        Create a new account
/chat            Main real-time chat interface
/profile         User profile & settings
 API Endpoints
Auth
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login (returns JWT)
GET  /api/auth/profile     # Get user profile (protected)
Messages
GET    /api/messages/:roomId     # Get messages for a room
POST   /api/messages             # Send a message
DELETE /api/messages/:id         # Delete a message
Rooms
GET    /api/rooms          # Get all available rooms
POST   /api/rooms          # Create a new room
DELETE /api/rooms/:id      # Delete a room
✨ Features
Frontend

⚡ Real-time messaging powered by Socket.IO
🟢 Live online/offline user presence indicators
💬 Multiple chat rooms support
📱 Fully mobile responsive design
🔔 Toast notifications for new messages
✍️ Typing indicators
🕐 Message timestamps
🔐 Protected routes with JWT auth
Backend

🔌 Socket.IO for bi-directional real-time events
🔐 JWT authentication with bcryptjs password hashing
🗄️ Persistent message history with MongoDB
🌐 CORS configured for frontend origin
⚠️ Global error handling middleware

 the Use Case Diagram, showing the interactions between actors and the system:
   <img width="860" height="780" alt="image" src="https://github.com/user-attachments/assets/5810f764-3f1f-4b55-9213-36f17f8c2dba" />
the Class Diagram, showing the structure of the codebase:
<img width="1000" height="755" alt="image" src="https://github.com/user-attachments/assets/b3657c7d-e132-4494-974a-eb442830d5b1" />
the ER Diagram, showing the structure:
<img width="860" height="780" alt="image" src="https://github.com/user-attachments/assets/40aac4b7-db49-4488-bf82-b96cb1d8a175" />


