import React, { useState, useEffect, useContext } from 'react';
import axios from '../config/axios';
import { Loader2, Trophy, Medal } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useContext(SocketContext);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/api/users/leaderboard');
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('leaderboard_update', () => {
        console.log('Real-time leaderboard update received');
        fetchLeaderboard(); // Simply refetch on any update for simplicity
      });

      return () => {
        socket.off('leaderboard_update');
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Global Leaderboard</h1>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-4 px-6 font-medium text-text-muted w-24 text-center">Rank</th>
              <th className="py-4 px-6 font-medium text-text-muted">Coder</th>
              <th className="py-4 px-6 font-medium text-text-muted text-right">Problems Solved</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length > 0 ? (
              leaderboard.map((user, idx) => (
                <tr key={user.userId} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-bold text-center">
                    {idx === 0 ? <Medal className="w-6 h-6 text-yellow-400 mx-auto" /> : 
                     idx === 1 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" /> : 
                     idx === 2 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" /> : 
                     <span className="text-text-muted">#{idx + 1}</span>}
                  </td>
                  <td className="py-4 px-6 font-medium text-white text-lg">
                    {user.name}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-primary text-xl">
                    {user.problemsSolved}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-12 text-center text-text-muted">
                  No users on the leaderboard yet. Be the first to solve a problem!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
