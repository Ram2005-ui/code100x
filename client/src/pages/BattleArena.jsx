import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from '../config/axios';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Play, Send, Loader2, Trophy, Frown, Flag, Swords, Timer } from 'lucide-react';

const LANGUAGE_VERSIONS = {
  54: { name: 'C++', ext: 'cpp' },
  62: { name: 'Java', ext: 'java' },
  71: { name: 'Python', ext: 'python' },
  63: { name: 'JavaScript', ext: 'javascript' }
};

const BattleArena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const [battle, setBattle] = useState(null);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('// Write your code here');
  const [languageId, setLanguageId] = useState(63);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [battleWinner, setBattleWinner] = useState(null);
  const [battleReason, setBattleReason] = useState(null);

  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [totalCases, setTotalCases] = useState(1);
  const [opponent, setOpponent] = useState(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const res = await axios.get(`/api/battles/${id}`);
        setBattle(res.data);
        setProblem(res.data.problemId);
        
        let initialTime = 1800; // 30 mins
        if (res.data.problemId.difficulty === 'Medium') initialTime = 2700;
        if (res.data.problemId.difficulty === 'Hard') initialTime = 3600;
        
        if (res.data.status === 'active') {
          // Calculate how much time has passed since start
          const elapsed = Math.floor((Date.now() - new Date(res.data.startTime).getTime()) / 1000);
          setTimeLeft(Math.max(0, initialTime - elapsed));
          setTimerActive(true);
        } else {
          setTimeLeft(0);
        }

        const currentUserId = user._id || user.id;
        const opp = res.data.players.find(p => p.userId._id !== currentUserId);
        if (opp) setOpponent(opp.userId.name);

        if (res.data.status === 'finished') {
          setBattleWinner(res.data.winner);
          setTimerActive(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBattle();
  }, [id, user]);

  useEffect(() => {
    if (!socket || !id) return;
    
    socket.emit('join_battle_room', id);

    socket.on('battle_progress', ({ userId, passedCases, totalCases }) => {
      setTotalCases(totalCases);
      const currentUserId = user._id || user.id;
      if (userId === currentUserId) {
        setMyProgress(passedCases);
      } else {
        setOpponentProgress(passedCases);
      }
    });

    socket.on('battle_over', ({ winner, reason }) => {
      setBattleWinner(winner);
      setBattleReason(reason);
      setTimerActive(false);
    });

    socket.on('submission_status_changed', ({ submissionId, status, userId: subUserId }) => {
      const currentUserId = user._id || user.id;
      if (subUserId === currentUserId || !subUserId) {
        setRunResults({ overallStatus: status, results: [] });
        setIsSubmitting(false);
      }
    });

    return () => {
      socket.off('battle_progress');
      socket.off('battle_over');
      socket.off('submission_status_changed');
    };
  }, [socket, id, user.id]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds) => {
    if (seconds === null) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setRunResults(null);
    try {
      const res = await axios.post('/api/submissions/run', {
        problemId: problem._id,
        languageId,
        code
      });
      setRunResults(res.data);
    } catch (err) {
      setRunResults({ overallStatus: 'Error running code' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setRunResults({ overallStatus: 'Submitting...' });
    try {
      const res = await axios.post('/api/submissions', {
        problemId: problem._id,
        languageId,
        code,
        battleId: id
      });
      socket.emit('join_submission_room', res.data.submissionId);
    } catch (err) {
      console.error(err);
      setRunResults({ overallStatus: 'Error submitting code' });
      setIsSubmitting(false);
    }
  };

  const handleSurrender = async () => {
    if (!window.confirm("Are you sure you want to surrender?")) return;
    try {
      await axios.post(`/api/battles/${id}/surrender`);
    } catch (err) {
      console.error(err);
    }
  };

  if (!problem) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Top Battle Bar */}
      <div className="h-16 bg-background border-b border-white/10 flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-background to-red-500/10 opacity-50"></div>
        
        <div className="flex-1 flex flex-col z-10">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-bold text-blue-400">You ({myProgress}/{totalCases})</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.max(5, (myProgress / totalCases) * 100)}%` }}></div>
          </div>
        </div>

        <div className="px-8 z-10 flex flex-col items-center">
          <div className={`flex items-center gap-1.5 font-mono text-sm px-2 py-0.5 rounded-full mb-1 bg-black/40 border ${timeLeft === 0 ? 'text-red-500 border-red-500/30' : timeLeft < 300 ? 'text-yellow-500 border-yellow-500/30' : 'text-text-muted border-white/10'}`}>
            <Timer className="w-3 h-3" />
            {formatTime(timeLeft)}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Swords className="w-4 h-4 text-primary animate-pulse" /> VS <Swords className="w-4 h-4 text-primary animate-pulse" />
          </span>
        </div>

        <div className="flex-1 flex flex-col z-10 items-end">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-bold text-red-400">Opponent: {opponent || '?'} ({opponentProgress}/{totalCases})</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex justify-end">
            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.max(5, (opponentProgress / totalCases) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Problem */}
        <div className="w-1/2 flex flex-col border-r border-white/10">
          <div className="p-6 overflow-y-auto flex-1 prose prose-invert max-w-none">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold m-0">{problem.title}</h1>
              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                problem.difficulty === 'Easy' ? 'bg-secondary/20 text-secondary' :
                problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="text-text-main whitespace-pre-wrap leading-relaxed mt-4">
              {problem.description}
            </div>
          </div>
          
          {/* Output Panel */}
          <div className="h-1/3 bg-background border-t border-white/10 p-4 overflow-y-auto">
            <h3 className="font-bold text-sm mb-2 text-text-muted">Console Output</h3>
            {isRunning ? (
              <div className="flex items-center text-text-muted text-sm"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</div>
            ) : runResults ? (
              <div className="text-sm">
                <div className={`font-bold mb-2 ${runResults.overallStatus === 'Accepted' ? 'text-secondary' : 'text-red-400'}`}>
                  {runResults.overallStatus}
                </div>
                {runResults.results?.map((res, i) => (
                  <div key={i} className="mb-2 p-2 bg-white/5 rounded">
                    <div className="font-medium text-xs text-text-muted mb-1">Test Case {res.index}</div>
                    {res.status !== 'Passed' && (
                      <div className="mt-1 space-y-1 text-xs">
                        {res.error ? (
                          <div className="text-red-400 font-mono break-all">{res.error}</div>
                        ) : (
                          <>
                            <div className="text-red-400">Output: <span className="font-mono">{res.actualOutput}</span></div>
                            <div className="text-secondary">Expected: <span className="font-mono">{res.expectedOutput}</span></div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-text-muted italic">Run your code to see output...</div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor */}
        <div className="w-1/2 flex flex-col relative">
          <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-background">
            <select
              value={languageId}
              onChange={(e) => setLanguageId(Number(e.target.value))}
              className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer"
            >
              {Object.entries(LANGUAGE_VERSIONS).map(([id, lang]) => (
                <option key={id} value={id} className="bg-background">{lang.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSurrender}
                className="text-xs flex items-center px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Flag className="w-3 h-3 mr-1" /> Surrender
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting || battleWinner}
                className="text-sm flex items-center px-4 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-1" /> Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting || battleWinner}
                className="text-sm flex items-center px-4 py-1.5 rounded btn-primary disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />} 
                Submit
              </button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={LANGUAGE_VERSIONS[languageId].ext}
              theme="vs-dark"
              value={code}
              onChange={setCode}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
            />
          </div>

          {/* Battle Over Overlay */}
          {battleWinner && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="glass-panel p-8 text-center max-w-sm w-full transform animate-in zoom-in duration-300">
                {battleWinner === (user._id || user.id) ? (
                  <>
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/50">
                      <Trophy className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-yellow-500 mb-2">You Won!</h2>
                    <p className="text-text-muted mb-6">
                      {battleReason === 'surrender' ? 'Opponent surrendered.' : 'You solved the problem first!'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
                      <Frown className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-red-500 mb-2">You Lost</h2>
                    <p className="text-text-muted mb-6">
                      {battleReason === 'surrender' ? 'You surrendered.' : 'Opponent solved the problem first!'}
                    </p>
                  </>
                )}
                <button
                  onClick={() => navigate('/battles')}
                  className="w-full btn-primary py-3"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleArena;
