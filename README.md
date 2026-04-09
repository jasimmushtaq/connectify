■ Daft Connect Chat Zone — Real-Time Chat
Application
A modern real-time chat application that enables instant messaging, live user interaction, and
seamless communication across clients.
■ Tech Stack
Frontend: React.js + Vite + Tailwind CSS
Backend: Node.js + Express.js
Real-Time: Socket.IO / WebSockets
Database: MongoDB (Mongoose)
Auth: JWT (JSON Web Tokens)
Styling: Modern UI + Responsive Design
■ Project Structure
chat-app/
■■■ client/
■ ■■■ src/
■ ■■■ components/
■ ■■■ context/
■ ■■■ pages/
■ ■■■ services/
■■■ server/
 ■■■ controllers/
 ■■■ middleware/
 ■■■ models/
 ■■■ routes/
 ■■■ sockets/
 ■■■ server.js
■■ Setup & Installation
Prerequisites: Node.js v18+, MongoDB
Backend Setup
cd server
npm install
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat_db
JWT_SECRET=your_secret_key
npm start
Frontend Setup
cd client
npm install
npm run dev
http://localhost:5173
■ Features
- Real-time messaging with instant updates
- Fully responsive chat UI
- User authentication with JWT
- Online/offline user tracking
- Persistent chat storage
- Socket-based communication
