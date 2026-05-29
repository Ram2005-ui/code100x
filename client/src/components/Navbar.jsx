import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, LogOut, User as UserIcon, Swords } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-x-0 border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white group">
          <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          Code100x
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/problems" className="text-text-muted hover:text-white transition-colors">Problems</Link>
          <Link to="/submissions" className="text-text-muted hover:text-white transition-colors">Submissions</Link>
          <Link to="/battles" className="text-primary hover:text-white transition-colors font-medium flex items-center gap-1">
            <Swords className="w-4 h-4" /> Battles
          </Link>
          <Link to="/contests" className="text-text-muted hover:text-white transition-colors">Contests</Link>
          
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          
          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <Link to="/admin" className="text-accent hover:text-white transition-colors font-medium text-sm">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
                <UserIcon className="w-4 h-4" />
                <span>{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-sm">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-text-muted hover:text-white transition-colors font-medium">Log in</Link>
              <Link to="/register" className="btn-primary py-1.5 px-4 text-sm">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
