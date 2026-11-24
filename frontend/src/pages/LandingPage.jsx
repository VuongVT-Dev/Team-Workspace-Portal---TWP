import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConstellationMesh from '../components/lucian/ConstellationMesh';
import MagneticArrowButton from '../components/lucian/MagneticArrowButton';
import LoginModalCard from '../components/auth/LoginModalCard';
import { Layers, LogIn, ShieldCheck, Kanban, CalendarClock } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Modal lifecycle: 'closed' | 'opening' | 'open' | 'closing'
  const [modalPhase, setModalPhase] = useState('closed');
  const openTimerRef = useRef(0);
  const closeTimerRef = useRef(0);
  const rafRef = useRef(0);

  const triggerOpenModal = useCallback((withButtonDelay = false) => {
    window.clearTimeout(openTimerRef.current);
    window.clearTimeout(closeTimerRef.current);
    window.cancelAnimationFrame(rafRef.current);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = withButtonDelay && !reducedMotion ? 260 : 0;

    openTimerRef.current = window.setTimeout(() => {
      setModalPhase('opening');
      // Two animation frames guarantee the browser paints the initial off-bottom transform before transitioning up
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = window.requestAnimationFrame(() => {
          setModalPhase('open');
        });
      });
    }, delay);
  }, []);

  const closeModal = useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    window.clearTimeout(closeTimerRef.current);
    window.cancelAnimationFrame(rafRef.current);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setModalPhase('closed');
      return;
    }

    setModalPhase('closing');
    closeTimerRef.current = window.setTimeout(() => {
      setModalPhase('closed');
    }, 320);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(openTimerRef.current);
      window.clearTimeout(closeTimerRef.current);
      window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isModalMounted = modalPhase !== 'closed';
  const isModalVisible = modalPhase === 'open';
  const isModalClosing = modalPhase === 'closing';

  useEffect(() => {
    if (!isModalMounted) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalMounted, closeModal]);

  const handleNavigateWithMotion = (targetPath) => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) {
      navigate(targetPath);
      return;
    }
    window.setTimeout(() => {
      navigate(targetPath);
    }, 360);
  };

  const handleEnterApp = () => {
    if (isAuthenticated) {
      handleNavigateWithMotion(user?.role === 'ADMIN' ? '/admin/dashboard' : '/workspace');
    } else {
      triggerOpenModal(true);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden">
      {/* Interactive Cursor-linked Constellation Mesh Background (Lucian #341) */}
      <ConstellationMesh fullscreen />

      {/* Center Hero Section (gently recedes while Login Modal rises) */}
      <main
        className={`twp-landing-stage flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 ${isModalVisible ? 'is-receded' : ''
          }`}
        aria-hidden={isModalVisible}
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-8 ring-4 ring-white/10">
          <Layers className="w-10 h-10 text-white" />
        </div>

        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wider uppercase text-indigo-200 mb-5">
          Internal Graduation Project Portal
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Team Workspace Portal{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
            TWP
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
          Nếu một nỗ lực của bạn được ví như 1 một vì sao - Bầu trời của bạn có rực rỡ hay không? Câu trả lời nằm ở hành động của bạn.
        </p>

        {/* Primary Action Button (Lucian #002 Magnetic Arrow Button) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <>
              <MagneticArrowButton
                theme="dark"
                label={`Vào Workspace (${user?.username})`}
                activeLabel="Đang mở Workspace..."
                onClick={handleEnterApp}
              />
              <button
                type="button"
                onClick={() => triggerOpenModal(false)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập tài khoản khác</span>
              </button>
            </>
          ) : (
            <MagneticArrowButton
              theme="dark"
              label="Đăng nhập"
              activeLabel="Đang mở..."
              onClick={() => triggerOpenModal(true)}
            />
          )}
        </div>

        {/* Subtle Highlights */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full text-left">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Kanban className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="text-xs font-bold text-white">Quy trình 5 trạng thái</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Back Log → Processing → Pending → Reviewing → Done với cảnh báo quá hạn tự động.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-white">Phân quyền chặt chẽ</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Phân tách rõ Admin, Team Leader, Co-Leader và Member thường.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <CalendarClock className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="text-xs font-bold text-white">Lịch học & Cuộc họp</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Tìm giờ rảnh chung từ thời khóa biểu, tạo lịch họp và đồng bộ môi trường.
            </p>
          </div>
        </div>
      </main>

      <footer
        className={`twp-landing-stage py-5 text-center text-[11px] text-slate-500 relative z-10 ${isModalVisible ? 'is-receded' : ''
          }`}
      >
        © 2026 Team Workspace Portal TWP — Nơi bạn biết rõ khả năng của mình
      </footer>

      {/* Rising Login Modal over the live Constellation Mesh */}
      {isModalMounted && (
        <div
          className={`twp-login-backdrop ${isModalVisible ? 'is-open' : ''} ${isModalClosing ? 'is-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="twp-login-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="twp-login-sheet">
            <LoginModalCard isModal onClose={closeModal} autoFocus={isModalVisible} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
