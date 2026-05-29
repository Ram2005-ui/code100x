import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { Loader2, Timer, AlertCircle, CheckCircle, Trophy, Play } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [contest, setContest] = useState(null);
  const [participation, setParticipation] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Problems');
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState(new Set());

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await axios.get(`/api/contests/${id}`);
        setContest(res.data);
        
        // Start participation immediately if logged in and contest is running
        const start = new Date(res.data.startTime);
        const end = new Date(res.data.endTime);
        const now = new Date();
        
        if (user && now >= start && now <= end) {
          const partRes = await axios.post(`/api/contests/${id}/start`);
          setParticipation(partRes.data);
        }
          if (user) {
            const statusRes = await axios.get(`/api/contests/${id}/my-status`);
            if (statusRes.data.solvedProblems) {
              setSolvedProblems(new Set(statusRes.data.solvedProblems));
            }
          }
      } catch (err) {
        console.error('Failed to fetch contest', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id, user]);

  useEffect(() => {
    if (activeTab === 'Leaderboard') {
      const fetchLeaderboard = async () => {
        try {
          const res = await axios.get(`/api/contests/${id}/leaderboard`);
          setLeaderboard(res.data);
        } catch (err) {
          console.error('Failed to fetch leaderboard', err);
        }
      };
      fetchLeaderboard();
    }
  }, [activeTab, id]);

  useEffect(() => {
    let interval = null;
    if (contest && participation && !participation.isSubmitted) {
      const durationMs = new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime();
      const endTime = new Date(new Date(participation.startTime).getTime() + durationMs);
      
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((endTime.getTime() - new Date().getTime()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          handleSubmitContest(); // Auto-submit when time runs out
        }
      };
      
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [contest, participation]);

  const handleSubmitContest = async () => {
    if (!window.confirm("Are you sure you want to finish the contest? Your score will be frozen.")) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/contests/${id}/submit`);
      setParticipation(res.data);
      setTimeLeft(0);
      setActiveTab('Leaderboard');
    } catch (err) {
      console.error('Failed to submit contest', err);
      alert('Failed to submit contest');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    if (h > 0) return `${h}:${m}:${s}`;
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!contest) return <div className="text-center py-20 text-xl font-medium">Contest not found</div>;

  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const isUpcoming = now < start;
  const isEnded = now > end;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="glass-panel p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-4">{contest.title}</h1>
          <p className="text-lg text-text-muted mb-6 max-w-2xl">{contest.description}</p>
          
          <div className="flex flex-wrap items-center gap-6 p-4 bg-black/20 rounded-xl border border-white/5 w-max">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-accent" />
              <span className="font-semibold text-white">Starts:</span>
              <span className="text-text-muted">{start.toLocaleString()}</span>
            </div>
            <div className="w-px h-6 bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-white">Ends:</span>
              <span className="text-text-muted">{end.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Personal Virtual Timer */}
        {!isUpcoming && participation && !isEnded && (
          <div className="bg-surface border border-primary/30 p-6 rounded-2xl flex flex-col items-center min-w-[200px]">
            <span className="text-sm font-semibold text-primary mb-2 tracking-wide uppercase">Time Remaining</span>
            <div className="text-5xl font-bold font-mono text-white tracking-wider mb-4">
              {formatTime(timeLeft)}
            </div>
            {participation.isSubmitted ? (
              <span className="text-secondary font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Submitted</span>
            ) : (
              <button 
                onClick={handleSubmitContest} 
                disabled={submitting}
                className="btn-primary w-full shadow-lg shadow-primary/20"
              >
                {submitting ? 'Submitting...' : 'Finish Contest'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-lg w-max border border-white/5">
        <button 
          className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors ${activeTab === 'Problems' ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
          onClick={() => setActiveTab('Problems')}
        >
          <Play className="w-4 h-4" /> Problems
        </button>
        <button 
          className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors ${activeTab === 'Leaderboard' ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
          onClick={() => setActiveTab('Leaderboard')}
        >
          <Trophy className="w-4 h-4" /> Leaderboard
        </button>
      </div>
      
      {activeTab === 'Problems' && (
        isUpcoming ? (
          <div className="glass-panel p-12 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Contest is Inactive</h3>
            <p className="text-text-muted">
              The problems will be revealed when the contest begins.
            </p>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="py-4 px-6 font-medium text-text-muted w-16 text-center">#</th>
                  <th className="py-4 px-6 font-medium text-text-muted">Problem Name</th>
                  <th className="py-4 px-6 font-medium text-text-muted text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {contest.problems && contest.problems.length > 0 ? (
                  contest.problems.map((prob, idx) => (
                    <tr key={prob._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-accent">{String.fromCharCode(65 + idx)}</td>
                      <td className="py-4 px-6 font-medium text-white flex items-center gap-3">
                        {prob.title}
                        {solvedProblems.has(prob._id.toString()) && (
                          <CheckCircle className="w-4 h-4 text-secondary" title="Solved" />
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          to={`/problems/${prob._id}`} 
                          state={isEnded ? {} : { contestId: contest._id }}
                          className={`btn-secondary py-1.5 px-4 text-sm ${!isEnded && participation?.isSubmitted ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                        >
                          {solvedProblems.has(prob._id.toString()) ? 'Solved' : 'Solve'}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-text-muted">
                      No problems added to this contest yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      {activeTab === 'Leaderboard' && (
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-4 px-6 font-medium text-text-muted w-16 text-center">Rank</th>
                <th className="py-4 px-6 font-medium text-text-muted">Coder</th>
                <th className="py-4 px-6 font-medium text-text-muted text-center">Score</th>
                <th className="py-4 px-6 font-medium text-text-muted text-right">Penalty</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length > 0 ? (
                leaderboard.map((u, idx) => (
                  <tr key={u.userId} className={`border-b border-white/10 hover:bg-white/5 transition-colors ${u.userId === user?._id ? 'bg-primary/5' : ''}`}>
                    <td className="py-4 px-6 font-bold text-center text-text-muted">{idx + 1}</td>
                    <td className="py-4 px-6 font-medium text-white">{u.name} {u.userId === user?._id && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">You</span>}</td>
                    <td className="py-4 px-6 text-center font-bold text-primary">{u.score}</td>
                    <td className="py-4 px-6 text-right text-text-muted">{Math.floor(u.lastSubmitTime / 60000)}m</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-text-muted">
                    No participants yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContestDetail;
