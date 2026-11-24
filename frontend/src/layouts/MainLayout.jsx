import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TEAM_ROLE_LABELS } from '../utils/taskHelpers';
import AccountMenu from '../components/lucian/AccountMenu';
import ExpandingSideRail from '../components/lucian/ExpandingSideRail';
import Antigravity from '../components/effects/Antigravity';
import {
  LayoutDashboard,
  Kanban,
  CalendarClock,
  Video,
  Puzzle,
  UserPlus,
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'ADMIN';

  const railItems = [
    ...(isAdmin
      ? [
        { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { to: '/admin/members', label: 'Quản lý Member', icon: UserPlus },
      ]
      : []),
    { to: '/workspace', label: 'Workspace', icon: Kanban },
    { to: '/schedule', label: 'Lịch học & Nghỉ phép', icon: CalendarClock },
    { to: '/meetings', label: 'Meeting & Logtime', icon: Video },
    { to: '/extensions', label: 'Tiêu chuẩn & Mở rộng', icon: Puzzle },
  ];

  const resolvePageTitle = (pathname) => {
    if (pathname.startsWith('/admin/dashboard')) return 'Admin Dashboard';
    if (pathname.startsWith('/admin/members')) return 'Quản lý Thành viên';
    if (pathname.startsWith('/workspace')) return 'Workspace';
    if (pathname.startsWith('/schedule')) return 'Lịch học & Nghỉ phép';
    if (pathname.startsWith('/meetings')) return 'Meeting & Logtime';
    if (pathname.startsWith('/extensions')) return 'Tiêu chuẩn & Mở rộng';
    if (pathname.startsWith('/profile')) return 'Hồ sơ cá nhân';
    return 'Team Workspace Portal TWP';
  };

  const [displayTitle, setDisplayTitle] = useState(() => resolvePageTitle(location.pathname));
  const [titleSwap, setTitleSwap] = useState(false);
  const swapTimerRef = useRef(0);

  useEffect(() => {
    const nextTitle = resolvePageTitle(location.pathname);
    if (nextTitle === displayTitle) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setDisplayTitle(nextTitle);
      setTitleSwap(false);
      return undefined;
    }

    setTitleSwap(true);
    window.clearTimeout(swapTimerRef.current);
    swapTimerRef.current = window.setTimeout(() => {
      setDisplayTitle(nextTitle);
      setTitleSwap(false);
    }, 180);

    return () => {
      window.clearTimeout(swapTimerRef.current);
    };
  }, [location.pathname, displayTitle]);

  const getRoleDisplay = () => {
    if (user?.role === 'ADMIN') {
      return { text: 'ADMIN', style: 'bg-amber-100 text-amber-800 border border-amber-200' };
    }
    if (user?.teamRole === 'TEAM_LEADER') {
      return { text: 'TEAM LEADER', style: 'bg-indigo-100 text-indigo-800 border border-indigo-200' };
    }
    if (user?.teamRole === 'CO_LEADER') {
      return { text: 'CO-LEADER', style: 'bg-cyan-100 text-cyan-800 border border-cyan-200' };
    }
    return {
      text: TEAM_ROLE_LABELS[user?.teamRole] || 'MEMBER',
      style: 'bg-slate-100 text-slate-700 border border-slate-200',
    };
  };

  const roleBadge = getRoleDisplay();

  // Dynamic Antigravity particle palette matching TWP primary colors + Dark/Light & Admin/Workspace context
  const isAdminRoute = location.pathname.startsWith('/admin');
  const antigravityColors = isDark
    ? isAdminRoute
      ? ['#A5B4FC', '#FBBF24', '#818CF8', '#34D399']
      : ['#818CF8', '#A78BFA', '#38BDF8', '#34D399']
    : isAdminRoute
      ? ['#4F46E5', '#D97706', '#6366F1', '#10B981']
      : ['#4F46E5', '#6366F1', '#0EA5E9', '#10B981'];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans p-2.5 gap-2.5">
      {/* Left Expanding Side Rail (Lucian UX/UI #040 — profile omitted as it is in top-right) */}
      <ExpandingSideRail
        brandName="TWP Portal"
        items={railItems}
        activePath={location.pathname}
        onSelect={(item) => navigate(item.to)}
        onBrandClick={() => navigate('/')}
      />

      {/* Right Column: Rounded Shell with Top Header Bar + Antigravity Ambient Background + Scrollable Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 rounded-3xl border border-slate-200/80 shadow-sm relative">
        {/* Top Header Bar with animated page title & Account Menu (#408 + #447) at Top-Right */}
        <header className="h-16 px-5 md:px-7 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between gap-4 shrink-0 z-30">
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Team Workspace Portal TWP
            </span>
            <h1 className={`u040-title text-slate-900 truncate ${titleSwap ? 'swap' : ''}`}>
              {displayTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-bold text-slate-800">
                {user?.fullName || user?.username}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono text-slate-400">{user?.studentCode}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${roleBadge.style}`}>
                  {roleBadge.text}
                </span>
              </div>
            </div>

            <AccountMenu
              user={user}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onProfile={() => navigate('/profile')}
              onHelp={() => navigate('/')}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* Workspace Viewport with React Bits <Antigravity /> Background */}
        <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0">
            <Antigravity
              colors={antigravityColors}
              count={950}
              magnetRadius={8}
              ringRadius={6.5}
              particleSize={0.85}
              ambient={0.22}
              autoAnimate={true}
              interactive={true}
              clickBurst={true}
              lightMode={!isDark}
              opacity={isDark ? 0.48 : 0.36}
            />
          </div>

          {/* Main Scrollable Content Area */}
          <main className="relative z-10 flex-1 overflow-y-auto flex flex-col">
            <div className="p-5 md:p-7 max-w-7xl w-full mx-auto flex-1">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
