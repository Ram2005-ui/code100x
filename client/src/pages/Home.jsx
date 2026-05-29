import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Zap, Trophy, ArrowRight, Code2, Cpu, Globe, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketContext } from '../context/SocketContext';
import axios from '../config/axios';
import { Calendar, Users, Code, Target, Award } from 'lucide-react';

const Home = () => {
  const socket = useContext(SocketContext);
  const [activities, setActivities] = useState([
    { id: '1', type: 'system', message: '🟢 Platform is online and ready.', timestamp: new Date() }
  ]);
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/stats/home');
        setStatsData(res.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleActivity = (data) => {
      setActivities(prev => {
        const updated = [{ ...data, id: Math.random().toString() }, ...prev];
        return updated.slice(0, 5); // Keep last 5
      });
    };
    
    socket.on('global_activity', handleActivity);
    return () => socket.off('global_activity', handleActivity);
  }, [socket]);
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 bg-grid animate-grid opacity-50" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-32">
          
          <motion.div 
            className="flex-1 space-y-8 text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-primary/30 text-primary mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-wide uppercase">Code at the speed of thought</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-pulse pb-2">
              Think Faster. Code Smarter. <br/> Code100x
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-text-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
              The next generation competitive programming platform. Practice coding, join contests, and elevate your software engineering skills.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              <Link to="/problems" className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                Start Coding <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/leaderboard" className="btn-secondary px-8 py-4 text-lg hover:bg-white/5 flex items-center justify-center">
                View Leaderboard
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Graphic */}
          <motion.div 
            className="flex-1 hidden lg:block relative animate-float"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl rounded-full" />
            <div className="glass-panel p-6 border-t border-l border-white/20 shadow-2xl relative">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-4 text-sm font-mono text-text-muted">solution.js</div>
              </div>
              <pre className="text-sm font-mono text-gray-300 leading-relaxed overflow-hidden">
                <code className="text-accent">const</code> <span className="text-blue-400">solve</span> = (nums) =&gt; {'{\n'}
                {'  '}return nums.<span className="text-yellow-300">sort</span>().<span className="text-yellow-300">reduce</span>((a, b) =&gt; {'{\n'}
                {'    '}return a + b;<br/>
                {'  '}, 0);<br/>
                {'}'};
              </pre>
            </div>
            
            {/* Secondary floating element */}
            <div className="absolute -bottom-8 -left-8 glass-panel p-4 flex items-center gap-4 animate-float-slow bg-surface/90 border-secondary/30">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <Globe className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <div className="text-xs text-text-muted">Global Rank</div>
                <div className="font-bold text-white">#42</div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Global Activity Feed (Replaces Live Stats Ribbon) */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" /> Live Activity
            </h3>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <div className="glass-panel p-4 h-64 overflow-y-hidden relative flex flex-col justify-start gap-3">
            <AnimatePresence>
              {activities.map((act) => (
                <motion.div 
                  key={act.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-black/30 border border-white/5 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="text-sm font-medium text-white">{act.message}</div>
                  <div className="text-xs text-text-muted whitespace-nowrap ml-4">
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {/* Gradient fade out at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0f1115] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Code on 100x?</h2>
          <p className="text-text-muted max-w-2xl mx-auto">Everything you need to practice, compete, and improve your algorithmic problem-solving skills.</p>
        </div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="glass-panel p-8 glow-border group cursor-default relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
              <Terminal className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 relative z-10">Modern Editor</h3>
            <p className="text-text-muted leading-relaxed relative z-10">Experience our state-of-the-art Monaco-powered editor with syntax highlighting, auto-complete, and multiple themes.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="glass-panel p-8 glow-border group cursor-default relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
              <Trophy className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3 relative z-10">Competitive Contests</h3>
            <p className="text-text-muted leading-relaxed relative z-10">Join weekly contests, compete with peers, and climb the global leaderboard to showcase your skills.</p>
          </motion.div>
        </motion.div>

        {statsData && (
          <div className="mt-24 mb-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Platform Overview</h2>
              <p className="text-text-muted max-w-2xl mx-auto">Real-time statistics from our active coding community.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              <div className="glass-panel p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-4xl font-bold text-white mb-1">{statsData.stats.users}</div>
                <div className="text-sm text-text-muted uppercase tracking-wider">Registered Coders</div>
              </div>
              <div className="glass-panel p-6 text-center">
                <Code className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-4xl font-bold text-white mb-1">{statsData.stats.problems}</div>
                <div className="text-sm text-text-muted uppercase tracking-wider">Active Problems</div>
              </div>
              <div className="glass-panel p-6 text-center">
                <Target className="w-8 h-8 text-secondary mx-auto mb-3" />
                <div className="text-4xl font-bold text-white mb-1">{statsData.stats.submissions}</div>
                <div className="text-sm text-text-muted uppercase tracking-wider">Total Submissions</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Upcoming Contest */}
              {statsData.upcomingContest && (
                <div className="glass-panel p-8 bg-black/40">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-bold">Next Upcoming Contest</h3>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h4 className="text-lg font-bold text-white mb-2">{statsData.upcomingContest.title}</h4>
                    <p className="text-sm text-text-muted mb-4 line-clamp-2">{statsData.upcomingContest.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <div className="text-sm text-white font-mono bg-black/50 px-3 py-1.5 rounded text-accent">
                        Starts: {new Date(statsData.upcomingContest.startTime).toLocaleString()}
                      </div>
                      <Link to="/contests" className="text-sm text-primary hover:text-white font-medium flex items-center gap-1">
                        View Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Coders */}
              {statsData.topUsers && statsData.topUsers.length > 0 && (
                <div className="glass-panel p-8 bg-black/40">
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-bold">Top Global Coders</h3>
                  </div>
                  <div className="space-y-3">
                    {statsData.topUsers.map((u, i) => (
                      <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-500/20 text-orange-400'}`}>
                            #{i + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            <img src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="avatar" className="w-10 h-10 rounded-full border border-white/10" />
                            <span className="font-semibold text-white">{u.name}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-secondary">{u.solvedCount}</div>
                          <div className="text-xs text-text-muted uppercase">Problems</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
