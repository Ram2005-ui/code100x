import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import Submissions from './pages/Submissions';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import ContestList from './pages/ContestList';
import ContestDetail from './pages/ContestDetail';
import AdminPanel from './pages/AdminPanel';
import Battles from './pages/Battles';
import BattleArena from './pages/BattleArena';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '24532169008-6iv5gk6e6fnigdod614mbgmi7vhq1v0i.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/problems" element={<ProtectedRoute><ProblemList /></ProtectedRoute>} />
                  <Route path="/problems/:id" element={<ProtectedRoute><ProblemDetail /></ProtectedRoute>} />
                  <Route path="/submissions" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/contests" element={<ProtectedRoute><ContestList /></ProtectedRoute>} />
                  <Route path="/contests/:id" element={<ProtectedRoute><ContestDetail /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                  <Route path="/battles" element={<ProtectedRoute><Battles /></ProtectedRoute>} />
                  <Route path="/battles/:id" element={<ProtectedRoute><BattleArena /></ProtectedRoute>} />
                </Routes>
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </Router>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
