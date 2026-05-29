import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from '../config/axios';
import { Loader2, Play, CheckCircle, XCircle, FileText, Clock, Terminal, Lightbulb, Timer, ChevronLeft, ChevronRight, MessageSquare, BookOpen, UserCircle, Plus } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { getLanguageName } from '../utils/languageMapping';
import TerminalStream from '../components/TerminalStream';

const LANGUAGES = [
  { id: 71, name: 'Python (3.8.1)', value: 'python', defaultCode: 'def solve():\n    pass\n\nif __name__ == "__main__":\n    solve()' },
  { id: 54, name: 'C++ (GCC 9.2.0)', value: 'cpp', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}' },
  { id: 62, name: 'Java (OpenJDK 13.0.1)', value: 'java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}' },
  { id: 63, name: 'JavaScript (Node.js 12.14.0)', value: 'javascript', defaultCode: 'function solve() {\n    \n}\n\nsolve();' }
];

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const contestId = location.state?.contestId;
  
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  
  const [problem, setProblem] = useState(null);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Description');
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finishingContest, setFinishingContest] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [runResults, setRunResults] = useState(null);
  
  // Custom Test Case State
  const [customInputEnabled, setCustomInputEnabled] = useState(false);
  const [customInput, setCustomInput] = useState('');
  
  // Discussions State
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  
  const [participation, setParticipation] = useState(null);
  const [timerActive, setTimerActive] = useState(false);

  // Layout state
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for mobile check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || isMobile) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      // Enforce limits between 20% and 80%
      if (newWidth > 20 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, isMobile]);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(null);

  // AI Hint state
  const [loadingHint, setLoadingHint] = useState(false);
  const [hint, setHint] = useState(null);
  const [showHintModal, setShowHintModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProb = await axios.get(`/api/problems/${id}`);
        setProblem(resProb.data);
        
        let fetchedContest = null;
        let fetchedParticipation = null;
        
        if (contestId) {
          const resContest = await axios.get(`/api/contests/${contestId}`);
          fetchedContest = resContest.data;
          setContest(fetchedContest);
          
          try {
            const partRes = await axios.post(`/api/contests/${contestId}/start`);
            fetchedParticipation = partRes.data;
            setParticipation(fetchedParticipation);
          } catch (e) { console.error('Not participating', e); }
        }
        
        if (fetchedContest && fetchedParticipation) {
          const durationMs = new Date(fetchedContest.endTime).getTime() - new Date(fetchedContest.startTime).getTime();
          const pEndTime = new Date(new Date(fetchedParticipation.startTime).getTime() + durationMs);
          
          const remaining = Math.max(0, Math.floor((pEndTime.getTime() - new Date().getTime()) / 1000));
          
          if (fetchedParticipation.isSubmitted || remaining <= 0) {
            setTimeLeft(0);
            setTimerActive(false);
          } else {
            setTimeLeft(remaining);
            setTimerActive(true);
          }
        } else {
          // Initialize timer based on difficulty
          let initialTime = 1800; // 30 mins default
          if (resProb.data.difficulty === 'Medium') initialTime = 2700; // 45 mins
          if (resProb.data.difficulty === 'Hard') initialTime = 3600; // 60 mins
          setTimeLeft(initialTime);
          setTimerActive(true);
        }
        
        // Reset code to boilerplate when a new problem is loaded
        setCode(language.defaultCode);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, contestId]);

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
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    if (h > 0) return `${h}:${m}:${s}`;
    return `${m}:${s}`;
  };

  const handleGetHint = async () => {
    if (!problem) return;
    setLoadingHint(true);
    setShowHintModal(true);
    setHint(null);
    try {
      const res = await axios.post('/api/ai/hint', {
        problemId: id,
        code,
        languageName: language.name,
        runResults
      });
      setHint(res.data.hint);
    } catch (err) {
      setHint(err.response?.data?.message || 'Failed to get hint. Please check your API key.');
    } finally {
      setLoadingHint(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Submissions' && user) {
      const fetchSubmissions = async () => {
        setLoadingSubmissions(true);
        try {
          const res = await axios.get(`/api/submissions/problem/${id}`);
          setSubmissions(res.data);
        } catch (err) {
          console.error('Failed to fetch submissions', err);
        } finally {
          setLoadingSubmissions(false);
        }
      };
      fetchSubmissions();
    }
  }, [activeTab, id, user, submissionStatus]);

  useEffect(() => {
    if (activeTab === 'Discussions') {
      const fetchComments = async () => {
        setLoadingComments(true);
        try {
          const res = await axios.get(`/api/problems/${id}/comments`);
          setComments(res.data);
        } catch (err) {
          console.error('Failed to fetch comments', err);
        } finally {
          setLoadingComments(false);
        }
      };
      fetchComments();
    }
  }, [activeTab, id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setPostingComment(true);
    try {
      const res = await axios.post(`/api/problems/${id}/comments`, { content: newComment });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment', err);
      alert('Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleLanguageChange = (e) => {
    const selected = LANGUAGES.find(l => l.id === parseInt(e.target.value));
    setLanguage(selected);
    setCode(selected.defaultCode);
  };

  const handleRun = async () => {
    setRunning(true);
    setRunResults(null);
    setActiveTab('Test Results');

    try {
      const payload = {
        problemId: id,
        languageId: language.id,
        code: code
      };
      if (customInputEnabled) {
        payload.customInput = customInput;
      }
      
      const res = await axios.post('/api/submissions/run', payload);
      setRunResults(res.data);
    } catch (err) {
      console.error('Run failed', err);
      setRunResults({ overallStatus: 'Error running code' });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Please login to submit code");
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setSubmissionStatus('Pending');
    setActiveTab('Submissions');
    
    try {
      const res = await axios.post('/api/submissions', {
        problemId: id,
        languageId: language.id,
        code: code
      });
      
      const { submissionId } = res.data;
      
      if (socket) {
        socket.emit('join_submission_room', submissionId);
        console.log('Joined submission room:', submissionId);
        
        const handleStatusChange = (data) => {
          console.log('Submission status update:', data);
          if (data.submissionId === submissionId) {
            setSubmissionStatus(data.status);
            
            // Stop the timer if the submission was accepted
            if (data.status === 'Accepted') {
              setTimerActive(false);
            }

            if (data.status !== 'Pending' && data.status !== 'Processing' && data.status !== 'In Queue') {
              setSubmitting(false);
              socket.off('submission_status_changed', handleStatusChange);
            }
          }
        };
        
        socket.on('submission_status_changed', handleStatusChange);
        
        setTimeout(() => {
          socket.off('submission_status_changed', handleStatusChange);
          setSubmitting((prev) => {
            if (prev) {
              console.error('Submission timeout - no response from backend in 60 seconds');
              setSubmissionStatus('Submission Failed - Backend Timeout');
              return false;
            }
            return prev;
          });
        }, 60000);
      } else {
        console.error('Socket not connected');
        setSubmitting(false);
        setSubmissionStatus('Socket Connection Failed');
      }

    } catch (err) {
      console.error('Submission failed', err);
      setSubmitting(false);
      setSubmissionStatus('Submission Failed');
    }
  };

  const handleFinishContest = async () => {
    if (!contestId) return;
    if (!window.confirm("Are you sure you want to finish the contest? Your score will be frozen.")) return;
    setFinishingContest(true);
    try {
      await axios.post(`/api/contests/${contestId}/submit`);
      navigate(`/contests/${contestId}`, { state: { activeTab: 'Leaderboard' } });
    } catch (err) {
      console.error('Failed to submit contest', err);
      alert('Failed to submit contest');
      setFinishingContest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!problem) return <div className="text-center py-20">Problem not found</div>;

  const currentProblemIndex = contest?.problems.findIndex(p => p._id === id);
  const prevProblem = currentProblemIndex > 0 ? contest.problems[currentProblemIndex - 1] : null;
  const nextProblem = currentProblemIndex !== -1 && contest?.problems && currentProblemIndex < (contest.problems.length - 1) ? contest.problems[currentProblemIndex + 1] : null;

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-73px)] relative">
      {/* Left Panel: Description & Submissions */}
      <div 
        className="w-full md:w-auto border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-surface/30 min-h-[50vh] md:min-h-0"
        style={!isMobile ? { width: `${leftWidth}%` } : {}}
      >
        
        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/20 overflow-x-auto">
          <button 
            className={`flex-1 py-3 px-4 min-w-max text-sm font-medium transition-colors ${activeTab === 'Description' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('Description')}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> Description
            </div>
          </button>
          {!contestId && (
            <button 
              className={`flex-1 py-3 px-4 min-w-max text-sm font-medium transition-colors ${activeTab === 'Editorial' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
              onClick={() => setActiveTab('Editorial')}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" /> Editorial
              </div>
            </button>
          )}
          {!contestId && (
            <button 
              className={`flex-1 py-3 px-4 min-w-max text-sm font-medium transition-colors ${activeTab === 'Discussions' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
              onClick={() => setActiveTab('Discussions')}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" /> Discussions
              </div>
            </button>
          )}
          <button 
            className={`flex-1 py-3 px-4 min-w-max text-sm font-medium transition-colors ${activeTab === 'Submissions' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('Submissions')}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" /> Submissions
            </div>
          </button>
          <button 
            className={`flex-1 py-3 px-4 min-w-max text-sm font-medium transition-colors ${activeTab === 'Test Results' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('Test Results')}
          >
            <div className="flex items-center justify-center gap-2">
              <Terminal className="w-4 h-4" /> Test Results
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative">
          <TerminalStream isRunning={running} isSubmitting={submitting} />
          {activeTab === 'Description' ? (
            <>
              {contest && (
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-accent">Contest: {contest.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => prevProblem && navigate(`/problems/${prevProblem._id}`, { state: { contestId } })}
                      disabled={!prevProblem}
                      className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs font-semibold ${prevProblem ? 'border-white/20 hover:bg-white/10 text-white' : 'border-white/5 text-white/30 cursor-not-allowed'}`}
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <button 
                      onClick={() => nextProblem && navigate(`/problems/${nextProblem._id}`, { state: { contestId } })}
                      disabled={!nextProblem}
                      className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs font-semibold ${nextProblem ? 'border-white/20 hover:bg-white/10 text-white' : 'border-white/5 text-white/30 cursor-not-allowed'}`}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">
                    {contest && currentProblemIndex !== -1 && `${String.fromCharCode(65 + currentProblemIndex)}. `}
                    {problem.title}
                  </h1>
                  {problem.status === 'Solved' && (
                    <CheckCircle className="w-6 h-6 text-secondary" title="Solved" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-2 py-1 rounded-md font-medium ${
                    problem.difficulty === 'Easy' ? 'bg-secondary/20 text-secondary' : 
                    problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-text-main whitespace-pre-wrap leading-relaxed">
                  {problem.description}
                </div>
                
                <h3 className="text-xl font-bold mt-8 mb-4 border-b border-white/10 pb-2">Examples</h3>
                {problem.testCases && problem.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                  <div key={idx} className="mb-6 bg-black/30 rounded-lg border border-white/5 overflow-hidden">
                    <div className="bg-white/5 px-4 py-2 font-medium border-b border-white/5">Example {idx + 1}</div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-text-muted mb-1 font-semibold uppercase tracking-wider">Input</div>
                        <pre className="bg-white/5 p-3 rounded text-sm text-white font-mono overflow-x-auto">
                          {tc.input}
                        </pre>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted mb-1 font-semibold uppercase tracking-wider">Output</div>
                        <pre className="bg-white/5 p-3 rounded text-sm text-white font-mono overflow-x-auto">
                          {tc.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : activeTab === 'Editorial' ? (
            <div className="prose prose-invert max-w-none">
              {!problem.editorial ? (
                <div className="text-center py-10 text-text-muted">
                  No editorial available for this problem yet.
                </div>
              ) : (
                <div className="text-text-main whitespace-pre-wrap leading-relaxed bg-black/20 p-6 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold m-0">Official Solution</h2>
                  </div>
                  {problem.editorial}
                </div>
              )}
            </div>
          ) : activeTab === 'Discussions' ? (
            <div className="space-y-6">
              {!user ? (
                <div className="text-center py-10 text-text-muted">
                  Please log in to join the discussion.
                </div>
              ) : (
                <form onSubmit={handlePostComment} className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <textarea 
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary text-sm resize-y min-h-[100px]"
                    placeholder="Share your approach, ask a question, or discuss with others..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  <div className="flex justify-end mt-3">
                    <button type="submit" disabled={postingComment} className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2">
                      {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                      Post Comment
                    </button>
                  </div>
                </form>
              )}
              
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-bold border-b border-white/10 pb-2 mb-4">Community Comments ({comments.length})</h3>
                {loadingComments ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-10 text-text-muted">No discussions yet. Be the first to comment!</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment._id} className="bg-black/10 border border-white/5 p-4 rounded-lg flex gap-4">
                      <div className="flex-shrink-0">
                        {comment.userId?.avatarUrl ? (
                          <img src={comment.userId.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <UserCircle className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white text-sm">{comment.userId?.name || 'Anonymous User'}</span>
                          <span className="text-xs text-text-muted">• {new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-text-main whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : activeTab === 'Submissions' ? (
            <div>
              {!user ? (
                <div className="text-center py-10 text-text-muted">
                  Please log in to see your submissions.
                </div>
              ) : loadingSubmissions ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-10 text-text-muted">
                  No submissions yet for this problem.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map(sub => (
                    <div key={sub._id} className="bg-black/20 border border-white/5 p-4 rounded-lg flex justify-between items-center hover:bg-white/5 transition-colors">
                      <div>
                        <div className={`font-semibold mb-1 ${
                          sub.status === 'Accepted' ? 'text-secondary' : 
                          sub.status === 'Pending' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {sub.status}
                        </div>
                        <div className="text-xs text-text-muted">
                          {new Date(sub.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white/5 px-3 py-1 rounded text-sm font-mono text-text-main">
                        {getLanguageName(sub.languageId)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'Test Results' ? (
            <div className="flex flex-col h-full">
              {/* Custom Test Case Toggle Section */}
              <div className="mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={customInputEnabled} 
                      onChange={(e) => setCustomInputEnabled(e.target.checked)} 
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${customInputEnabled ? 'bg-primary' : 'bg-white/10'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${customInputEnabled ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-white">Custom Test Case</span>
                    <span className="text-xs text-text-muted">Test your code against your own input before submitting</span>
                  </div>
                </label>
                
                {customInputEnabled && (
                  <div className="mt-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Input (stdin)</label>
                      <button 
                        onClick={() => {
                          const size = prompt("Array Size?", "5");
                          if (size) {
                            const arr = Array.from({length: parseInt(size)}, () => Math.floor(Math.random() * 100));
                            setCustomInput(`${size}\n${arr.join(' ')}`);
                          }
                        }}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Auto-generate Array
                      </button>
                    </div>
                    <textarea 
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary resize-y h-32"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter your custom input here..."
                    />
                  </div>
                )}
              </div>

              {running ? (
                <div className="flex flex-col items-center justify-center py-12 text-text-muted flex-1">
                  <p className="animate-pulse">Execution in progress...</p>
                </div>
              ) : runResults ? (
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-6 ${runResults.overallStatus === 'Accepted' ? 'text-secondary' : 'text-red-500'}`}>
                    Status: {runResults.overallStatus}
                  </h3>
                  
                  {runResults.results && runResults.results.map((res, idx) => (
                    <div key={idx} className="mb-6 bg-black/30 rounded-lg border border-white/5 overflow-hidden">
                      <div className="bg-white/5 px-4 py-2 font-medium border-b border-white/5 flex items-center gap-2">
                        {res.status === 'Passed' ? <CheckCircle className="w-4 h-4 text-secondary" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        Test Case {res.index}
                        <span className="ml-auto text-sm text-text-muted">{res.status}</span>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <div className="text-xs text-text-muted mb-1 font-semibold uppercase tracking-wider">Input</div>
                          <pre className="bg-white/5 p-3 rounded text-sm text-white font-mono overflow-x-auto">
                            {res.input}
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs text-text-muted mb-1 font-semibold uppercase tracking-wider">Your Output</div>
                          <pre className="bg-white/5 p-3 rounded text-sm text-white font-mono overflow-x-auto">
                            {res.actualOutput || (res.error ? `Error: ${res.error}` : '(Empty)')}
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs text-text-muted mb-1 font-semibold uppercase tracking-wider">Expected Output</div>
                          <pre className="bg-white/5 p-3 rounded text-sm text-white font-mono overflow-x-auto">
                            {res.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-text-muted">
                  Click "Run Code" to test your solution against the sample test cases.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Draggable Divider (Desktop Only) */}
      <div 
        className="hidden md:flex w-1.5 cursor-col-resize bg-transparent hover:bg-primary/50 active:bg-primary z-10 transition-colors items-center justify-center -ml-[3px]"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
      >
        <div className={`h-8 w-1 rounded-full transition-colors ${isDragging ? 'bg-primary' : 'bg-white/20 group-hover:bg-white/50'}`} />
      </div>

      {/* Right Panel: Code Editor */}
      <div 
        className="w-full md:w-auto flex flex-col bg-[#1e1e1e] min-h-[50vh] md:min-h-0"
        style={!isMobile ? { width: `calc(${100 - leftWidth}% - 6px)` } : {}}
      >
        {/* Editor Toolbar */}
        <div className="h-12 border-b border-white/10 bg-surface flex items-center justify-between px-4">
          <select 
            className="bg-black/20 border border-white/10 text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-primary"
            value={language.id}
            onChange={handleLanguageChange}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 font-mono text-sm px-3 py-1 rounded bg-black/20 border ${timeLeft === 0 ? 'text-red-500 border-red-500/30' : timeLeft < 300 ? 'text-yellow-500 border-yellow-500/30' : 'text-text-muted border-white/10'}`}>
              <Timer className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>

            {participation && !participation.isSubmitted && (
              <button
                onClick={handleFinishContest}
                disabled={finishingContest}
                className="py-1 px-3 text-sm font-semibold flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-colors"
              >
                {finishingContest ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Finish Contest
              </button>
            )}
            
            {!contestId && (
              <button 
                onClick={handleGetHint}
                className="py-1.5 px-3 text-sm flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 rounded transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                Get Hint
              </button>
            )}
            
            <button 
              onClick={handleRun}
              disabled={running || submitting || participation?.isSubmitted}
              className={`btn-primary py-1.5 px-4 text-sm flex items-center gap-2 bg-surface hover:bg-white/10 border border-white/20 text-white ${participation?.isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              Run Code
            </button>
            
            <button 
              onClick={handleSubmit}
              disabled={submitting || running || participation?.isSubmitted}
              className={`btn-primary py-1.5 px-4 text-sm flex items-center gap-2 bg-secondary hover:bg-secondary/80 shadow-secondary/20 ${participation?.isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              Submit Code
            </button>
          </div>
        </div>
        
        {/* Monaco Editor */}
        <div className="flex-grow">
          <Editor
            height="100%"
            language={language.value}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              padding: { top: 16 },
              readOnly: participation?.isSubmitted
            }}
          />
        </div>
      </div>

      {/* AI Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-2xl w-full max-h-[80vh] flex flex-col relative overflow-hidden animate-in zoom-in duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
            
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                </div>
                <h2 className="text-xl font-bold">AI Code Tutor</h2>
              </div>
              <button onClick={() => setShowHintModal(false)} className="text-text-muted hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-sm text-text-main leading-relaxed">
              {loadingHint ? (
                <div className="flex flex-col items-center justify-center py-12 text-yellow-500/70">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="animate-pulse font-medium">Analyzing your code...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  {/* Using standard line breaks since we removed react-markdown */}
                  {hint.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
              <button onClick={() => setShowHintModal(false)} className="btn-secondary py-1.5 px-4 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDetail;