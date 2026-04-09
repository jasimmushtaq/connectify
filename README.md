💬 connectify — Real-Time Chat Application
A full-featured real-time chat application built for seamless, instant communication.
🚀 Tech Stack
LayerTechnology
FrontendReact.js + Vite + Tailwind CSS
BackendNode.js + Express.jsDatabaseMongoDB (Mongoose)
Real-TimeSocket.IOAuthJWT (JSON Web Tokens)
StylingCustom theme + Modern UI
daft-connect/
├── client/                   # React frontend
│   └── src/
│       ├── components/       # Navbar, ChatBox, MessageBubble, UserList
│       ├── context/          # AuthContext, SocketContext
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── ChatPage.jsx
│       │   └── ProfilePage.jsx
│       └── services/
│           └── api.js        # Axios API service
│
└── server/                   # Express backend
    ├── controllers/          # authController, messageController, roomController
    ├── middleware/           # authMiddleware (JWT)
    ├── models/               # User, Message, Room schemas
    ├── routes/               # authRoutes, messageRoutes, roomRoutes
    ├── socket/               # Socket.IO event handlers
    └── server.js             # Entry point
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
   <img width="860" height="780" alt="image" src="https://github.com/user-attachments/assets/6b98b203-fa55-4b00-8034-bb7dd251cd01" />
