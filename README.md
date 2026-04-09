💬 connectify — Real-Time Chat Application
A full-featured real-time chat application built for seamless, instant communication.
<img width="820" height="598" alt="image" src="https://github.com/user-attachments/assets/d1bb8c49-98ef-4c37-8f05-171ef6b8ddab" />

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
<img width="820" height="919" alt="image" src="https://github.com/user-attachments/assets/84092f45-0717-4698-a1e1-f58b757eaf20" />


<img width="820" height="867" alt="image" src="https://github.com/user-attachments/assets/b019794e-ef8f-4706-b83d-84057655abeb" />


 the Use Case Diagram, showing the interactions between actors and the system:
   <img width="860" height="780" alt="image" src="https://github.com/user-attachments/assets/5810f764-3f1f-4b55-9213-36f17f8c2dba" />
the Class Diagram, showing the structure of the codebase:
<img width="1000" height="755" alt="image" src="https://github.com/user-attachments/assets/b3657c7d-e132-4494-974a-eb442830d5b1" />
the ER Diagram, showing the structure:
<img width="860" height="780" alt="image" src="https://github.com/user-attachments/assets/40aac4b7-db49-4488-bf82-b96cb1d8a175" />


