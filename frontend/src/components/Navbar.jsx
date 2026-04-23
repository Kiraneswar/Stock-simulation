import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LayoutDashboard, TrendingUp, Zap, Briefcase, History, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClasses = ({ isActive }) =>
    `flex items-center gap-4 py-4 px-10 transition-all relative group ${
      isActive 
        ? 'text-primary' 
        : 'text-on-surface-variant hover:text-on-surface'
    }`;

  const renderIndicator = (isActive) => 
    isActive ? (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_15px_#00d09c]"></div>
    ) : null;

  return (
    <div className="hidden lg:flex flex-col w-64 h-full bg-surface-container-low border-r border-[#3c4a43]/15 fixed inset-y-0 left-0 z-30 font-inter overflow-y-auto custom-scrollbar">
      <div className="p-10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary-container shadow-[0_0_15px_rgba(0,208,156,0.3)] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white/20 blur-[1px]"></div>
          </div>
          <span className="text-xl font-black tracking-tighter font-manrope uppercase">Obsidian</span>
        </div>
      </div>
      
      <nav className="flex flex-col flex-1">
        <NavLink to="/dashboard" className={navClasses}>
          {({ isActive }) => (
            <>
              {renderIndicator(isActive)}
              <LayoutDashboard size={20} />
              <span className="font-bold text-sm tracking-wide uppercase">Dashboard</span>
            </>
          )}
        </NavLink>
        <NavLink to="/market" className={navClasses}>
          {({ isActive }) => (
            <>
              {renderIndicator(isActive)}
              <TrendingUp size={20} />
              <span className="font-bold text-sm tracking-wide uppercase">Markets</span>
            </>
          )}
        </NavLink>
        <NavLink to="/terminal" className={navClasses}>
          {({ isActive }) => (
            <>
              {renderIndicator(isActive)}
              <Zap size={20} />
              <span className="font-bold text-sm tracking-wide uppercase">Terminal</span>
            </>
          )}
        </NavLink>
        <NavLink to="/portfolio" className={navClasses}>
          {({ isActive }) => (
            <>
              {renderIndicator(isActive)}
              <Briefcase size={20} />
              <span className="font-bold text-sm tracking-wide uppercase">Portfolio</span>
            </>
          )}
        </NavLink>
        <NavLink to="/leaderboard" className={navClasses}>
          {({ isActive }) => (
            <>
              {renderIndicator(isActive)}
              <History size={20} />
              <span className="font-bold text-sm tracking-wide uppercase">Rankings</span>
            </>
          )}
        </NavLink>
      </nav>

      <div className="p-6">
        <div className="p-6 rounded-[2rem] bg-surface-container-high/50 border border-white/5 mb-6">
          <p className="text-[0.65rem] font-black text-on-surface-variant uppercase tracking-widest mb-2">Liquid Capital</p>
          <p className="text-xl font-extrabold text-on-surface font-manrope">
            ₹{user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="flex flex-col gap-2 mb-6">
            <button 
                onClick={handleLogout}
                className="flex items-center gap-4 py-4 px-6 rounded-3xl bg-error/20 text-error hover:bg-error hover:text-white transition-all text-[0.7rem] font-black uppercase tracking-[0.2em] mb-4 shadow-xl shadow-error/10 border border-error/20"
            >
                <LogOut size={18} />
                Logout System
            </button>

            <button className="flex items-center gap-4 py-3 px-4 rounded-2xl text-on-surface-variant hover:bg-surface-container transition-all text-xs font-bold uppercase tracking-widest">
                <Settings size={16} />
                Terminal Config
            </button>
            <div className="flex items-center gap-3 py-3 px-4 text-primary font-black text-[0.6rem] uppercase tracking-widest">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                Data Stream Active
            </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
