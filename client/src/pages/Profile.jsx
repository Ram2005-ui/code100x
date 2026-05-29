import React, { useState, useEffect, useContext } from 'react';
import axios from '../config/axios';
import { Loader2, User as UserIcon, Code2, Target, History, Calendar, Trophy, Flame, Pencil, X, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, login } = useContext(AuthContext); // Use login to re-set user if needed, or just rely on local state
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/users/profile');
        setProfileData(res.data);
        setEditForm({
          name: res.data.user.name || '',
          bio: res.data.user.bio || '',
          avatarUrl: res.data.user.avatarUrl || ''
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!profileData) return <div className="text-center py-20">Failed to load profile.</div>;

  const { stats, heatmapData } = profileData;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/users/profile', editForm);
      setProfileData(prev => ({ ...prev, user: res.data }));
      setIsEditing(false);
      // Optional: Update AuthContext user if needed, but local profileData reflects it immediately
    } catch (err) {
      alert('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getColorClass = (count) => {
    if (count === 0) return 'bg-white/5';
    if (count < 3) return 'bg-green-900/60';
    if (count < 6) return 'bg-green-700/80';
    if (count < 10) return 'bg-green-500';
    return 'bg-green-400';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-text-muted">Manage your progress and statistics</p>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Pencil className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        
        {/* Main User Card (Spans 2 cols, 2 rows) */}
        <div className="glass-panel p-8 md:col-span-2 lg:col-span-3 lg:row-span-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 group-hover:scale-105 transition-transform duration-300">
                {profileData.user.avatarUrl ? (
                  <img src={profileData.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{profileData.user.name}</h2>
                <p className="text-text-muted mb-3">{profileData.user.email}</p>
                <div className="flex flex-col gap-2">
                  <span className="inline-flex px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider w-max">
                    {profileData.user.role === 'admin' ? 'Administrator' : 'Software Engineer'}
                  </span>
                  <p className="text-sm text-text-muted/80 max-w-sm mt-1">{profileData.user.bio}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-2 font-medium uppercase tracking-wider">Member Since</p>
              <div className="flex items-center gap-2 text-white font-semibold">
                <Calendar className="w-5 h-5 text-secondary" />
                {new Date(profileData.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Problems Solved Tile */}
        <div className="glass-panel p-6 md:col-span-2 lg:col-span-3 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <p className="text-text-muted text-sm uppercase tracking-wider font-semibold mb-1">Problems Solved</p>
            <p className="text-5xl font-black text-white">{stats.problemsSolved}</p>
          </div>
          <div className="relative z-10 p-4 bg-secondary/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <Target className="w-10 h-10 text-secondary" />
          </div>
        </div>

        {/* Total Submissions Tile */}
        <div className="glass-panel p-6 md:col-span-2 lg:col-span-3 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute inset-0 bg-gradient-to-tl from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <p className="text-text-muted text-sm uppercase tracking-wider font-semibold mb-1">Total Submissions</p>
            <p className="text-5xl font-black text-white">{stats.totalSubmissions}</p>
          </div>
          <div className="relative z-10 p-4 bg-accent/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <Code2 className="w-10 h-10 text-accent" />
          </div>
        </div>

        {/* Quick Stats Mini Tiles */}
        <div className="glass-panel p-6 md:col-span-1 lg:col-span-2 flex flex-col items-center justify-center text-center group hover:border-yellow-500/30 transition-colors">
          <Flame className="w-8 h-8 text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">Current Streak</p>
          <p className="text-2xl font-bold text-white">3 Days</p>
        </div>

        <div className="glass-panel p-6 md:col-span-1 lg:col-span-2 flex flex-col items-center justify-center text-center group hover:border-pink-500/30 transition-colors">
          <Trophy className="w-8 h-8 text-pink-500 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">Global Rank</p>
          <p className="text-2xl font-bold text-white">Top 15%</p>
        </div>

        {/* Heatmap (Spans full width) */}
        <div className="glass-panel p-8 md:col-span-4 lg:col-span-6 mt-2 overflow-x-auto">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold">Submission Activity</h2>
          </div>
          <div className="min-w-max pb-2">
            <div className="flex text-xs text-text-muted mb-2 gap-2">
              <span className="w-8"></span> {/* Spacer for days of week if needed */}
              {/* Months could be rendered here in a more advanced version */}
            </div>
            <div className="flex gap-1.5">
              <div className="grid grid-rows-7 gap-1.5 text-xs text-text-muted pr-2 font-medium">
                <span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span>
              </div>
              <div 
                className="grid gap-1.5"
                style={{ 
                  gridTemplateRows: 'repeat(7, 1fr)', 
                  gridAutoFlow: 'column'
                }}
              >
                {heatmapData?.map((day, idx) => (
                  <div 
                    key={idx} 
                    className={`w-3.5 h-3.5 rounded-sm ${getColorClass(day.count)} transition-colors hover:ring-1 hover:ring-white/50 cursor-pointer relative group`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {day.count} submissions on {day.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end items-center gap-2 mt-4 text-xs text-text-muted">
              <span>Less</span>
              <div className="w-3.5 h-3.5 rounded-sm bg-white/5"></div>
              <div className="w-3.5 h-3.5 rounded-sm bg-green-900/60"></div>
              <div className="w-3.5 h-3.5 rounded-sm bg-green-700/80"></div>
              <div className="w-3.5 h-3.5 rounded-sm bg-green-500"></div>
              <div className="w-3.5 h-3.5 rounded-sm bg-green-400"></div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Recent Activity (Spans full width below) */}
        <div className="glass-panel p-8 md:col-span-4 lg:col-span-6 mt-2 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Recent Submissions</h2>
            </div>
            <button className="text-sm text-primary hover:underline font-medium">View All</button>
          </div>
          
          {stats.recentSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentSubmissions.map((sub, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-black/30 rounded-lg">
                      <Code2 className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      sub.status === 'Accepted' ? 'bg-secondary/20 text-secondary border border-secondary/30' : 
                      sub.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                      'bg-red-500/20 text-red-500 border border-red-500/30'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="font-semibold text-white mb-1">{sub.problemId?.title || 'Code Submission'}</p>
                  <p className="text-xs text-text-muted">{new Date(sub.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl bg-white/5 border border-white/10 border-dashed">
              <History className="w-12 h-12 text-text-muted/50 mx-auto mb-3" />
              <p className="text-text-muted font-medium">No recent activity found.</p>
              <p className="text-sm text-text-muted/70 mt-1">Start solving problems to build your history!</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full relative animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Display Name</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-white"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Bio</label>
                <textarea 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-white h-24 resize-none"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Avatar Image</label>
                <input 
                  type="file"
                  accept="image/*"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditForm({...editForm, avatarUrl: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {editForm.avatarUrl && editForm.avatarUrl.startsWith('data:image') && (
                  <p className="text-xs text-green-400 mt-2">Image ready to be saved!</p>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg font-medium text-text-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
