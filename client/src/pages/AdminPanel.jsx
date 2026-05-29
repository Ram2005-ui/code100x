import React, { useState, useEffect, useContext } from 'react';
import axios from '../config/axios';
import { Loader2, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, Save, ExternalLink, Code2, Calendar, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const emptyTestCase = () => ({ input: '', expectedOutput: '', isHidden: false });
const emptyProblem = () => ({
  title: '',
  description: '',
  editorial: '',
  difficulty: 'Easy',
  testCases: [emptyTestCase()]
});

const emptyContest = () => {
  const now = new Date();
  const later = new Date(now.getTime() + 3600000); // +1 hour
  // format: YYYY-MM-DDThh:mm
  const formatDT = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return {
    title: '',
    description: '',
    startTime: formatDT(now),
    endTime: formatDT(later),
    problems: []
  };
};

const ProblemForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || emptyProblem());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) setForm(initial);
    else setForm(emptyProblem());
  }, [initial]);

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const updateTestCase = (idx, field, value) => {
    const tcs = [...form.testCases];
    tcs[idx] = { ...tcs[idx], [field]: value };
    setForm(f => ({ ...f, testCases: tcs }));
  };

  const addTestCase = () => setForm(f => ({ ...f, testCases: [...f.testCases, emptyTestCase()] }));

  const removeTestCase = (idx) => {
    const tcs = form.testCases.filter((_, i) => i !== idx);
    setForm(f => ({ ...f, testCases: tcs }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6">{initial?._id ? 'Edit Problem' : 'New Problem'}</h2>
      {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-text-muted mb-1 font-medium">Title</label>
          <input className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. Two Sum" />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1 font-medium">Difficulty</label>
          <select className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" value={form.difficulty} onChange={e => updateField('difficulty', e.target.value)}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1 font-medium">Description</label>
          <textarea className="w-full h-48 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary font-mono text-sm resize-y" value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Problem statement..." />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1 font-medium">Editorial (Markdown) - Optional</label>
          <textarea className="w-full h-32 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary font-mono text-sm resize-y" value={form.editorial || ''} onChange={e => updateField('editorial', e.target.value)} placeholder="Explain the solution..." />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Test Cases</h3>
          <button onClick={addTestCase} className="btn-secondary py-1 px-3 text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Test Case</button>
        </div>
        <div className="space-y-4">
          {(form.testCases || []).map((tc, idx) => (
            <div key={idx} className="bg-black/20 rounded-xl border border-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-muted">Test Case #{idx + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                    <input type="checkbox" className="accent-primary" checked={tc.isHidden} onChange={e => updateTestCase(idx, 'isHidden', e.target.checked)} /> Hidden
                  </label>
                  {form.testCases.length > 1 && (
                    <button onClick={() => removeTestCase(idx)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">Input (stdin)</label>
                  <textarea rows={3} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-primary resize-none" value={tc.input} onChange={e => updateTestCase(idx, 'input', e.target.value)} placeholder="Leave empty if no input" />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">Expected Output</label>
                  <textarea rows={3} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-primary resize-none" value={tc.expectedOutput} onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)} placeholder="Expected output..." />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="btn-secondary flex items-center gap-2"><X className="w-4 h-4" /> Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Problem
        </button>
      </div>
    </div>
  );
};

const ContestForm = ({ initial, problemsList, onSave, onCancel }) => {
  const formatDT = (dStr) => {
    if (!dStr) return '';
    const d = new Date(dStr);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [form, setForm] = useState(() => {
    if (initial) {
      return {
        ...initial,
        startTime: formatDT(initial.startTime),
        endTime: formatDT(initial.endTime),
        problems: initial.problems.map(p => typeof p === 'object' ? p._id : p)
      };
    }
    return emptyContest();
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleProblem = (id) => {
    setForm(f => {
      const current = f.problems || [];
      const newProblems = current.includes(id) ? current.filter(p => p !== id) : [...current, id];
      return { ...f, problems: newProblems };
    });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.startTime || !form.endTime) {
      setError('Title, Start Time, and End Time are required.');
      return;
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      setError('End Time must be after Start Time.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString()
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6">{initial?._id ? 'Edit Contest' : 'New Contest'}</h2>
      {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-text-muted mb-1 font-medium">Title</label>
          <input className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. Weekly Challenge" />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1 font-medium">Description</label>
          <textarea className="w-full h-24 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary font-mono text-sm resize-y" value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Contest description..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-muted mb-1 font-medium">Start Time</label>
            <input type="datetime-local" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary [color-scheme:dark]" value={form.startTime} onChange={e => updateField('startTime', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1 font-medium">End Time</label>
            <input type="datetime-local" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary [color-scheme:dark]" value={form.endTime} onChange={e => updateField('endTime', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Assign Problems</h3>
        <div className="bg-black/20 rounded-xl border border-white/5 p-4 max-h-64 overflow-y-auto space-y-2">
          {problemsList.length === 0 ? (
            <p className="text-text-muted text-sm">No problems exist. Create problems first.</p>
          ) : (
            problemsList.map(p => (
              <label key={p._id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors">
                <input type="checkbox" className="accent-primary" checked={(form.problems || []).includes(p._id)} onChange={() => toggleProblem(p._id)} />
                <span className="text-white text-sm font-medium">{p.title}</span>
                <span className="text-xs text-text-muted ml-auto bg-white/5 px-2 py-0.5 rounded">{p.difficulty}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="btn-secondary flex items-center gap-2"><X className="w-4 h-4" /> Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Contest
        </button>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('Problems');
  
  // Plagiarism state
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
  const [plagiarismResults, setPlagiarismResults] = useState([]);
  const [loadingPlagiarism, setLoadingPlagiarism] = useState(false);
  const [selectedContestName, setSelectedContestName] = useState('');
  const [disqualifiedSubmissions, setDisqualifiedSubmissions] = useState(new Set());
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProb, resCont] = await Promise.all([
        axios.get('/api/problems'),
        axios.get('/api/contests')
      ]);
      setProblems(resProb.data);
      setContests(resCont.data);
      
      if (location.state?.activeTab) {
        setActiveTab(location.state.activeTab);
      }
      if (location.state?.showForm) {
        setShowForm(true);
      }
      
      if (location.state?.editProblemId) {
        const problemToEdit = resProb.data.find(p => p._id === location.state.editProblemId);
        if (problemToEdit) {
          setActiveTab('Problems');
          handleEditClick(problemToEdit, 'Problems');
          window.history.replaceState({}, document.title);
        }
      } else if (location.state?.editContestId) {
        const contestToEdit = resCont.data.find(c => c._id === location.state.editContestId);
        if (contestToEdit) {
          setActiveTab('Contests');
          handleEditClick(contestToEdit, 'Contests');
          window.history.replaceState({}, document.title);
        }
      } else if (location.state?.activeTab || location.state?.showForm) {
        window.history.replaceState({}, document.title);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (form) => {
    try {
      if (activeTab === 'Problems') {
        await axios.post('/api/admin/problems', form);
        navigate('/problems');
      } else {
        await axios.post('/api/admin/contests', form);
        navigate('/contests');
      }
    } catch (err) {
      throw err;
    }
  };

  const handleUpdate = async (form) => {
    try {
      if (activeTab === 'Problems') {
        await axios.put(`/api/admin/problems/${editingItem._id}`, form);
        navigate('/problems');
      } else {
        await axios.put(`/api/admin/contests/${editingItem._id}`, form);
        navigate('/contests');
      }
    } catch (err) {
      throw err;
    }
  };

  const handleEditClick = async (item, type = activeTab) => {
    try {
      if (type === 'Problems') {
        const res = await axios.get(`/api/problems/${item._id}`);
        setEditingItem(res.data);
      } else {
        const res = await axios.get(`/api/contests/${item._id}`);
        setEditingItem(res.data);
      }
      setShowForm(false);
    } catch (err) {
      console.error('Error fetching details:', err);
      alert('Error fetching details: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab === 'Problems' ? 'problem' : 'contest'}?`)) return;
    if (activeTab === 'Problems') await axios.delete(`/api/admin/problems/${id}`);
    else await axios.delete(`/api/admin/contests/${id}`);
    fetchData();
  };

  const handlePlagiarismCheck = async (contest) => {
    setShowPlagiarismModal(true);
    setLoadingPlagiarism(true);
    setSelectedContestName(contest.title);
    setDisqualifiedSubmissions(new Set());
    try {
      const res = await axios.get(`/api/admin/contests/${contest._id}/plagiarism`);
      setPlagiarismResults(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to run plagiarism check');
    } finally {
      setLoadingPlagiarism(false);
    }
  };

  const handleDisqualify = async (subId) => {
    if (!window.confirm('Are you sure you want to disqualify this submission?')) return;
    try {
      await axios.post(`/api/admin/submissions/${subId}/disqualify`);
      setDisqualifiedSubmissions(prev => new Set(prev).add(subId));
    } catch (err) {
      console.error(err);
      alert('Failed to disqualify submission');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-text-muted mt-1">Manage platform content</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add {activeTab === 'Problems' ? 'Problem' : 'Contest'}
        </button>
      </div>

      {!showForm && !editingItem && (
        <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-lg w-max border border-white/5">
          <button 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors ${activeTab === 'Problems' ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('Problems')}
          >
            <Code2 className="w-4 h-4" /> Problems
          </button>
          <button 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-colors ${activeTab === 'Contests' ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('Contests')}
          >
            <Calendar className="w-4 h-4" /> Contests
          </button>
        </div>
      )}

      {(showForm || editingItem) && activeTab === 'Problems' && (
        <ProblemForm
          key={editingItem?._id || 'new'}
          initial={editingItem}
          onSave={editingItem ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}

      {(showForm || editingItem) && activeTab === 'Contests' && (
        <ContestForm
          key={editingItem?._id || 'new'}
          initial={editingItem}
          problemsList={problems}
          onSave={editingItem ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}

      {(!showForm && !editingItem) && (
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-4 px-6 font-medium text-text-muted">Title</th>
              {activeTab === 'Problems' ? (
                <>
                  <th className="py-4 px-6 font-medium text-text-muted">Difficulty</th>
                  <th className="py-4 px-6 font-medium text-text-muted text-center">Test Cases</th>
                </>
              ) : (
                <>
                  <th className="py-4 px-6 font-medium text-text-muted">Status</th>
                  <th className="py-4 px-6 font-medium text-text-muted text-center">Problems</th>
                </>
              )}
              <th className="py-4 px-6 font-medium text-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'Problems' ? problems.map((p) => (
              <tr key={p._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="py-4 px-6 font-medium text-white">{p.title}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    p.difficulty === 'Easy' ? 'bg-secondary/20 text-secondary' :
                    p.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {p.difficulty}
                  </span>
                </td>
                <td className="py-4 px-6 text-center text-text-muted">{p.testCases?.length || 0}</td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link to={`/problems/${p._id}`} className="text-secondary hover:text-white transition-colors" title="Solve Problem"><ExternalLink className="w-4 h-4" /></Link>
                    <button onClick={() => handleEditClick(p)} className="text-primary hover:text-white transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )) : contests.map((c) => {
              const now = new Date();
              const start = new Date(c.startTime);
              const end = new Date(c.endTime);
              let status = 'Upcoming';
              let statusColor = 'text-yellow-500 bg-yellow-500/10';
              if (now >= start && now <= end) { status = 'Running'; statusColor = 'text-secondary bg-secondary/10'; }
              else if (now > end) { status = 'Ended'; statusColor = 'text-text-muted bg-white/5'; }

              return (
                <tr key={c._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-medium text-white">{c.title}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColor}`}>
                      {status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-text-muted">{c.problems?.length || 0}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => handlePlagiarismCheck(c)} className="text-yellow-500 hover:text-yellow-400 transition-colors" title="Run Plagiarism Check"><ShieldAlert className="w-4 h-4" /></button>
                      <Link to={`/contests/${c._id}`} className="text-secondary hover:text-white transition-colors" title="View Contest"><ExternalLink className="w-4 h-4" /></Link>
                      <button onClick={() => handleEditClick(c)} className="text-primary hover:text-white transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {activeTab === 'Problems' && problems.length === 0 && (
              <tr><td colSpan="4" className="py-8 text-center text-text-muted">No problems found.</td></tr>
            )}
            {activeTab === 'Contests' && contests.length === 0 && (
              <tr><td colSpan="4" className="py-8 text-center text-text-muted">No contests found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      )}

      {/* Plagiarism Modal */}
      {showPlagiarismModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-yellow-500">
                  <ShieldAlert className="w-6 h-6" /> Plagiarism Report
                </h3>
                <p className="text-sm text-text-muted mt-1">{selectedContestName}</p>
              </div>
              <button onClick={() => setShowPlagiarismModal(false)} className="text-text-muted hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {loadingPlagiarism ? (
                <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-4">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                  <p className="animate-pulse text-sm">Analyzing abstract syntax and N-Grams across all submissions...</p>
                </div>
              ) : plagiarismResults.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Clean Contest!</h4>
                  <p>No pairs found with similarity &gt; 80%.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-6 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>Detected {plagiarismResults.length} highly suspicious pairs. These users have submitted logic that is structurally identical (ignoring whitespace and variable names).</p>
                  </div>
                  
                  {plagiarismResults.map((result, i) => (
                    <div key={i} className="bg-black/40 border border-white/10 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                        <span className="font-bold text-white">{result.problemTitle}</span>
                        <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded">
                          {result.similarity}% Match
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex-1 text-center bg-white/5 py-3 rounded-lg border border-white/5 flex flex-col items-center justify-between min-h-[100px]">
                          <div>
                            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">User 1</div>
                            <div className="font-medium text-white mb-3">{result.user1}</div>
                          </div>
                          <button 
                            onClick={() => handleDisqualify(result.sub1Id)}
                            disabled={disqualifiedSubmissions.has(result.sub1Id)}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${disqualifiedSubmissions.has(result.sub1Id) ? 'bg-red-500/20 text-red-500 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-red-500 hover:text-white'}`}
                          >
                            {disqualifiedSubmissions.has(result.sub1Id) ? 'Disqualified' : 'Disqualify'}
                          </button>
                        </div>
                        <div className="text-text-muted font-bold">VS</div>
                        <div className="flex-1 text-center bg-white/5 py-3 rounded-lg border border-white/5 flex flex-col items-center justify-between min-h-[100px]">
                          <div>
                            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">User 2</div>
                            <div className="font-medium text-white mb-3">{result.user2}</div>
                          </div>
                          <button 
                            onClick={() => handleDisqualify(result.sub2Id)}
                            disabled={disqualifiedSubmissions.has(result.sub2Id)}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${disqualifiedSubmissions.has(result.sub2Id) ? 'bg-red-500/20 text-red-500 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-red-500 hover:text-white'}`}
                          >
                            {disqualifiedSubmissions.has(result.sub2Id) ? 'Disqualified' : 'Disqualify'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
              <button onClick={() => setShowPlagiarismModal(false)} className="btn-secondary">Close Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
