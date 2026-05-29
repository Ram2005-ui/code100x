import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { Loader2, Search, Filter, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProblemList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get('/api/problems');
        setProblems(res.data);
      } catch (err) {
        console.error('Failed to fetch problems', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      await axios.delete(`/api/admin/problems/${id}`);
      setProblems(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete problem: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Problem Set</h1>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search problems..." 
              className="bg-surface border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-black/20 rounded-lg p-1 border border-white/5 overflow-hidden">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  difficultyFilter === diff 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-4 px-6 font-medium text-text-muted">Status</th>
              <th className="py-4 px-6 font-medium text-text-muted">Title</th>
              <th className="py-4 px-6 font-medium text-text-muted">Difficulty</th>
              <th className="py-4 px-6 font-medium text-text-muted text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem) => (
                <tr key={problem._id} className="border-b border-white/10 hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-6 text-text-muted">
                    {problem.status === 'Solved' ? (
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium text-white group-hover:text-primary transition-colors">
                    <Link to={`/problems/${problem._id}`}>{problem.title}</Link>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      problem.difficulty === 'Easy' ? 'bg-secondary/20 text-secondary' : 
                      problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {user && user.role === 'admin' && (
                        <>
                          <Link 
                            to="/admin" 
                            state={{ editProblemId: problem._id }}
                            className="text-text-muted hover:text-white transition-colors" 
                            title="Edit in Admin Panel"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={(e) => handleDelete(e, problem._id)} 
                            className="text-red-500/70 hover:text-red-500 transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <Link to={`/problems/${problem._id}`} className="text-primary hover:text-white transition-colors font-medium">
                        Solve
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-text-muted">
                  No problems found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProblemList;
