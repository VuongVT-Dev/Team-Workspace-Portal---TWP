import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MagneticArrowButton from '../lucian/MagneticArrowButton';
import { Layers, Lock, User, AlertCircle, ArrowLeft, X, Eye, EyeOff } from 'lucide-react';
import './LoginModalCard.css';

const LoginModalCard = ({ isModal = false, onClose, autoFocus = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!autoFocus) return undefined;
    const timer = window.setTimeout(() => {
      usernameRef.current?.focus({ preventScroll: true });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(username, password);
      if (loggedInUser?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/workspace');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-login-card="true"
      className="relative z-10 max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 text-left"
    >
      <div className="mb-4 flex items-center justify-between">
        {isModal ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang chủ</span>
          </button>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang chủ</span>
          </Link>
        )}

        {isModal && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng khung đăng nhập"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 mb-3">
          <Layers className="w-8 h-8" />
        </div>
        <h2 id="twp-login-modal-title" className="text-2xl font-bold text-slate-900">
          Team Workspace Portal TWP
        </h2>
        <p className="text-xs text-slate-500 mt-1">Cổng thông tin nội bộ nhóm đồ án tốt nghiệp</p>
        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-[11px] text-amber-700 font-medium">
          <span>Tài khoản được cấp trực tiếp bởi Admin</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tên đăng nhập</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={usernameRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              placeholder="Nhập tên đăng nhập"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <MagneticArrowButton
          type="submit"
          variant="form"
          label="Đăng nhập vào TWP"
          activeLabel="Đang xác thực..."
          disabled={loading}
          busy={loading}
        />
      </form>
    </div>
  );
};

export default LoginModalCard;
