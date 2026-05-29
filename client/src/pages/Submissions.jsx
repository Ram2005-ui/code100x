import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getLanguageName } from '../utils/languageMapping';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get('/api/submissions');
        setSubmissions(res.data);
      } catch (err) {
        console.error('Failed to fetch submissions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">My Submissions</h1>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-4 px-6 font-medium text-text-muted">Time</th>
              <th className="py-4 px-6 font-medium text-text-muted">Problem Name</th>
              <th className="py-4 px-6 font-medium text-text-muted">Language</th>
              <th className="py-4 px-6 font-medium text-text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length > 0 ? (
              submissions.map((sub) => (
                <tr key={sub._id} className="border-b border-white/10 hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-6 text-text-muted">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 font-medium text-white group-hover:text-primary transition-colors">
                    {sub.problemId?.title || sub.problemId}
                  </td>
                  <td className="py-4 px-6 text-text-muted">
                    {getLanguageName(sub.languageId)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`flex items-center gap-2 font-medium ${
                      sub.status === 'Accepted' ? 'text-secondary' : 
                      sub.status === 'Pending' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {sub.status === 'Accepted' && <CheckCircle className="w-4 h-4" />}
                      {sub.status === 'Pending' && <Clock className="w-4 h-4" />}
                      {sub.status !== 'Accepted' && sub.status !== 'Pending' && <XCircle className="w-4 h-4" />}
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-text-muted">
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Submissions;
