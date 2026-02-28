# 🗨️ Anonymous Random Text Chat System

A full-stack real-time web application that allows anonymous users to get randomly paired for one-to-one text chat.  
Built with **Node.js, WebSockets (Socket.IO), React, and SQL (CockroachDB)**, focusing on correctness, reliability, and clean architecture.

---

## 🚀 Live Demo

- **Frontend:** https://taptalentfrontend-hsb6.vercel.app/
- **Backend:** https://taptalentbackend-1.onrender.com

---

## 📌 Features

### Backend
- Anonymous user connection (no login)
- Temporary session/user ID
- Random one-to-one matchmaking
- Real-time text messaging using WebSockets
- Skip / end chat and re-match
- Proper disconnect handling with partner notification
- SQL-backed state for reliability
- Basic message length validation

### Frontend
- Simple and intuitive UI
- Start searching for a chat
- Live message display
- Send messages in real time
- Skip current chat
- Clear status indicators:
  - Idle
  - Searching
  - Connected
  - Partner disconnected

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- socket.io-client
- Framer Motion

### Backend
- Node.js
- Express.js
- Socket.IO
- PostgreSQL-compatible CockroachDB
- pg

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** CockroachDB Cloud

---

## 🧠 Architecture Overview
Browser (React)
↓ WebSocket (Socket.IO)
Backend (Node.js + Express)
↓ SQL
CockroachDB 


- Frontend never connects directly to the database
- Backend controls matchmaking and chat state
- Database ensures consistency during reconnects and disconnects

---

## 🔄 Matchmaking & Chat Flow

1. User opens the app → socket connects (user is **idle**)
2. User clicks **Start Chat**
3. Backend marks user as **searching**
4. When two searching users are available:
   - A chat session is created
   - Both users are marked **chatting**
   - `matched` event is emitted
5. Messages are exchanged in real time
6. If a user clicks **Skip** or disconnects:
   - Chat session ends
   - Partner is notified
   - Both users return to **idle**

---

## 🗄️ Database Schema (Simplified)

### users
- id (UUID)
- connection_id
- status (`idle | searching | chatting | disconnected`)
- connected_at
- last_activity

### chat_sessions
- id (UUID)
- user1_id
- user2_id
- started_at
- ended_at
- ended_by

### messages (optional)
- id
- user_id
- message
- created_at

---

## 🔐 Reliability & Safety Considerations

- State-driven matchmaking (idle → searching → chatting)
- Transaction-safe backend matchmaking
- Frontend ignores stale socket events
- No automatic matchmaking on connection
- User intent required to start chat

---

## 🧪 Local Setup & Testing

### Backend
```bash
npm install
npm run server
### FRONTEND
```bash
npm install
npm run dev

npm install
npm run dev

⚠️ Known Limitations

No chat history persistence after refresh

Text-only chat

Basic rate limiting 

👨‍💻 Author

Trivendra Kumar

GitHub: https://github.com/strivendra002

LinkedIn: https://www.linkedin.com/in/trivendra-kumar-b9302a226/

Portfolio: https://portfolio-two-pi-ejaoseqvam.vercel.app/