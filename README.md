Code100x


Code100x is a real-time competitive programming platform inspired by LeetCode and Codeforces. It features traditional coding problems, contests, and unique real-time 1v1 coding battles where users can race to solve challenges. The platform is augmented with AI capabilities to assist users during their learning journey.

Features

Real-Time 1v1 Battles: Matchmake with other users and compete head-to-head in live coding environments.
Problem Solving & Submissions: Browse a curated list of coding problems, write code using an embedded VS Code-like editor (Monaco), and submit solutions.
Live Status Updates: Receive real-time feedback on your code submissions (Running, Accepted, Failed) via WebSockets.
Contests & Leaderboards: Participate in time-bound coding contests and climb the global leaderboards.
AI Assistance: Get intelligent hints and code analysis powered by Groq.
Secure Authentication: Traditional Email/Password login alongside seamless Google OAuth integration.


Tech Stack

Frontend (Client)
Framework: React 19 + Vite
Styling: Tailwind CSS
Code Editor: Monaco Editor (@monaco-editor/react)
Animations: Framer Motion
Icons: Lucide React
Routing: React Router
Real-time: Socket.IO Client
Backend (Server)
Runtime: Node.js + Express.js
Database: MongoDB (via Mongoose)
Real-time: Socket.IO
Authentication: JWT, bcrypt, Google Auth Library
AI Integration: Groq SDK
Email Service: Nodemailer


Project Structure
text

code100x/
├── client/          # React frontend application
│   ├── src/         # React components, pages, and hooks
│   ├── public/      # Static assets
│   └── package.json # Frontend dependencies
└── server/          # Node.js backend application
    ├── controllers/ # Business logic for API endpoints
    ├── models/      # MongoDB Mongoose schemas (User, Problem, Battle, etc.)
    ├── routes/      # Express API routes definition
    ├── middleware/  # Custom middleware (Auth, Error handling)
    ├── index.js     # Main server entry point & Socket.IO setup
    └── package.json # Backend dependencies
