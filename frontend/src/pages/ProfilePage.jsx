import React, { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { TEAM_ROLE_LABELS } from '../utils/taskHelpers';
import {
  User,
  Mail,
  Hash,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setStudentCode(user.studentCode || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await authApi.updateProfile({
        fullName,
        email,
        studentCode,
        avatarUrl,
      });

      if (res?.data) {
        updateUser(res.data);
        setMessage('Cập nhật hồ sơ cá nhân thành công!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authApi.uploadAvatar(formData);
      if (res?.data) {
        setAvatarUrl(res.data);
      }
    } catch (err) {
      alert('Không thể tải ảnh lên');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hồ Sơ Thành Viên — TWP</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Thông tin cá nhân tối giản phục vụ việc trao đổi và phân quyền trong đồ án
        </p>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-800">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <span className="font-bold">Bảo Mật Quyền Riêng Tư (Privacy-First):</span> Hệ thống chỉ lưu trữ và hiển thị đúng 4 thông tin: Ảnh đại diện, Họ tên, Email và Mã số sinh viên. Tuyệt đối không thu thập CCCD, SĐT hay ngày sinh.
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* 1. Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100">
            <div className="relative group">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-full bg-slate-100 border-4 border-indigo-100 object-cover shadow-sm"
              />
              <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow transition">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-slate-800 text-sm">{fullName || user?.username}</h4>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400">
                  Quyền hệ thống:{' '}
                  <strong className="text-indigo-600 font-bold uppercase">{user?.role}</strong>
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-400">
                  Vai trò nhóm:{' '}
                  <strong className="text-emerald-600 font-bold">
                    {TEAM_ROLE_LABELS[user?.teamRole] || 'Member'}
                  </strong>
                </span>
              </div>
              <div className="pt-2">
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Hoặc dán URL ảnh trực tiếp:
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Full Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">1. Họ và tên sinh viên *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">2. Địa chỉ Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Student Code (MSSV) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">3. Mã số sinh viên (MSSV) *</label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none uppercase font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
