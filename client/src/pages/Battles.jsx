import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Swords, Loader2, Users } from 'lucide-react';

const Battles = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  
  const [isQueuing, setIsQueuing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('match_found', ({ battleId }) => {
      setIsQueuing(false);
      navigate(`/battles/${battleId}`);
    });

    socket.on('matchmaking_error', (msg) => {
      setError(msg);
      setIsQueuing(false);
    });

    return () => {
      socket.off('match_found');
      socket.off('matchmaking_error');
    };
  }, [socket, navigate]);

  const handleJoinQueue = () => {
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }
    setError('');
    setIsQueuing(true);
    socket.emit('join_matchmaking', { id: user._id || user.id, name: user.name });
  };

  const handleLeaveQueue = () => {
    setIsQueuing(false);
    if (socket) {
      socket.emit('leave_matchmaking', user._id || user.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-full mb-6">
          <Swords className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">1v1 Coding Battles</h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Test your skills against other developers in real-time. First to get an Accepted submission wins!
        </p>
      </div>

      <div className="glass-panel p-8 max-w-lg mx-auto text-center relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm relative z-10">
            {error}
          </div>
        )}

        {!isQueuing ? (
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Ready to Battle?</h2>
            <p className="text-text-muted mb-8">You will be matched with an opponent of similar skill.</p>
            <button
              onClick={handleJoinQueue}
              className="bg-primary hover:bg-primary-hover text-background font-bold text-xl py-4 px-12 rounded-full shadow-[0_0_40px_rgba(var(--primary),0.4)] hover:shadow-[0_0_60px_rgba(var(--primary),0.6)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
            >
              <Swords className="w-6 h-6" /> Find Match
            </button>
          </div>
        ) : (
          <div className="relative z-10 py-4">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm border-2 border-primary">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-primary">Searching...</h2>
            <p className="text-text-muted mb-8 animate-pulse">Looking for a worthy opponent</p>
            <button
              onClick={handleLeaveQueue}
              className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded-full transition-colors"
            >
              Cancel Search
            </button>
          </div>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Instant Matchmaking</h3>
          <p className="text-sm text-text-muted">Get paired with active players immediately from the global queue.</p>
        </div>
        <div className="glass-panel p-6 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary">1</span>
          </div>
          <h3 className="font-bold mb-2">Random Problem</h3>
          <p className="text-sm text-text-muted">A random problem is selected. You both start with a blank editor.</p>
        </div>
        <div className="glass-panel p-6 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Swords className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">First to Accept</h3>
          <p className="text-sm text-text-muted">See your opponent's progress in real-time. First to get Accepted wins!</p>
        </div>
      </div>
    </div>
  );
};

export default Battles;
