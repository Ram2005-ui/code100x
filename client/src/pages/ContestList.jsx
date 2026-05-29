import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import { Loader2, Calendar, Clock, ArrowRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ContestList = () => {
  const { user } = useContext(AuthContext);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await axios.get('/api/contests');
        setContests(res.data);
      } catch (err) {
        console.error('Failed to fetch contests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Calendar className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold">Contests</h1>
        </div>
        {user && user.role === 'admin' && (
          <Link 
            to="/admin" 
            state={{ activeTab: 'Contests', showForm: true }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Contest
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {contests.length > 0 ? (
          contests.map((contest) => {
            const now = new Date();
            const start = new Date(contest.startTime);
            const end = new Date(contest.endTime);
            
            let status = 'Upcoming';
            let statusColor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            
            if (now >= start && now <= end) {
              status = 'Running';
              statusColor = 'text-secondary bg-secondary/10 border-secondary/20';
            } else if (now > end) {
              status = 'Ended';
              statusColor = 'text-text-muted bg-white/5 border-white/10';
            }

            return (
              <div key={contest._id} className="glass-panel p-6 flex flex-col md:flex-row justify-between md:items-center gap-6 group hover:border-accent/30 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{contest.title}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-text-muted mb-4 max-w-2xl">{contest.description}</p>
                  <div className="flex items-center gap-6 text-sm font-medium text-text-muted">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {start.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Link to={`/contests/${contest._id}`} className="btn-secondary flex items-center gap-2 whitespace-nowrap md:w-auto justify-center group-hover:bg-white/10">
                    {status === 'Running' ? (contest.participation?.isStarted && !contest.participation?.isSubmitted ? 'Resume Contest' : 'Enter Contest') : status === 'Upcoming' ? 'View Details' : 'View Results'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  {user && user.role === 'admin' && (
                    <div className="flex items-center justify-end gap-3">
                      <Link 
                        to="/admin" 
                        state={{ activeTab: 'Contests', editContestId: contest._id }}
                        className="text-text-muted hover:text-white transition-colors p-2" 
                        title="Edit in Admin Panel"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!window.confirm('Are you sure you want to delete this contest?')) return;
                          try {
                            await axios.delete(`/api/admin/contests/${contest._id}`);
                            setContests(prev => prev.filter(c => c._id !== contest._id));
                          } catch (err) {
                            alert('Failed to delete contest: ' + (err.response?.data?.message || err.message));
                          }
                        }}
                        className="text-red-500/70 hover:text-red-500 transition-colors p-2" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 glass-panel">
            <p className="text-text-muted text-lg">No contests available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestList;
