import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { TEAM_ROLE_LABELS } from '../utils/taskHelpers';
import { TableRowsSkeleton } from '../components/lucian/SkeletonPrimitives';
import LucianDropdown from '../components/lucian/LucianDropdown';
import {
  UserPlus,
  Users,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Save,
  RefreshCw,
  Shield,
  User,
  Crown,
  Award,
} from 'lucide-react';

const AdminMembersPage = () => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states (Privacy-First: only avatarUrl, fullName, email, studentCode + auth/role)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [teamRole, setTeamRole] = useState('MEMBER');

  // Inline edits for existing members
  const [roleEdits, setRoleEdits] = useState({});

  const fetchMembers = async () => {
    setLoading(true);
    const start = Date.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minDelay = reducedMotion ? 0 : 350;
    try {
      const res = await adminApi.getMembers();
      const elapsed = Date.now() - start;
      if (elapsed < minDelay) {
        await new Promise((r) => setTimeout(r, minDelay - elapsed));
      }
      if (res?.data) {
        setMembers(res.data);
        const edits = {};
        res.data.forEach((m) => {
          edits[m.id] = { role: m.role, teamRole: m.teamRole || 'MEMBER' };
        });
        setRoleEdits(edits);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      await adminApi.createMember({
        username,
        password,
        fullName,
        email,
        studentCode,
        avatarUrl,
        role,
        teamRole,
      });
      setMessage(`Đã tạo tài khoản '${username}' thành công!`);
      setUsername('');
      setPassword('');
      setFullName('');
      setEmail('');
      setStudentCode('');
      setAvatarUrl('');
      setRole('MEMBER');
      setTeamRole('MEMBER');
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo tài khoản thành viên.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRole = async (memberId) => {
    const edit = roleEdits[memberId];
    if (!edit) return;
    setMessage('');
    setError('');
    try {
      await adminApi.updateMemberRole(memberId, edit);
      setMessage('Đã cập nhật phân quyền thành viên thành công!');
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật quyền thành viên.');
    }
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản '${member.username}' (${member.fullName})?`)) {
      return;
    }
    setMessage('');
    setError('');
    try {
      await adminApi.deleteMember(member.id);
      setMessage(`Đã xóa tài khoản '${member.username}'.`);
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa thành viên.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            Admin Only
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tạo Tài Khoản & Phân Quyền Thành Viên
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chỉ Admin có quyền cấp tài khoản mới và gán vai trò Team Leader / Co-Leader / Member
          </p>
        </div>

        <button
          onClick={fetchMembers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Role Permissions Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
          <div className="font-bold text-amber-900">1. ADMIN (Quản trị viên)</div>
          <p className="text-[11px] text-amber-800 mt-1">
            Toàn quyền hệ thống: tạo tài khoản Member, xem Admin Dashboard, tạo Phase, tạo & giao Task, review Task.
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
          <div className="font-bold text-indigo-900">2. MEMBER (Team Leader / Co-Leader)</div>
          <p className="text-[11px] text-indigo-800 mt-1">
            Role chủ chốt: được phép tạo Task, chỉ định người làm, đưa Task sang Reviewing & duyệt Done (với task mình tạo).
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
          <div className="font-bold text-slate-800">3. MEMBER (Thành viên thường)</div>
          <p className="text-[11px] text-slate-600 mt-1">
            Nhận Task, đổi trạng thái Back Log → Processing → Pending, nhập lịch học, tạo họp. Không thể tạo Task hoặc chuyển Reviewing.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Create Member Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Tạo Tài Khoản Member Mới</h3>
              <p className="text-[11px] text-slate-400">
                Tuân thủ Privacy-First: chỉ lưu Ảnh đại diện, Họ tên, Email và Mã số sinh viên
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy-First
          </span>
        </div>

        <form onSubmit={handleCreateMember} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên đăng nhập (Username) *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              placeholder="VD: member5"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mật khẩu *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="VD: Nguyễn Minh Anh"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mã số sinh viên (MSSV) *</label>
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              required
              placeholder="VD: SE160006"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white uppercase font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="anh.nm@fpt.edu.vn"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Link Ảnh đại diện (Tùy chọn)</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Để trống để tự tạo avatar"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quyền hệ thống *</label>
            <LucianDropdown
              value={role}
              onChange={(val) => setRole(val)}
              fullWidth
              showDot
              ariaLabel="Chọn quyền hệ thống"
              options={[
                { value: 'MEMBER', label: 'MEMBER (Thành viên)', desc: 'Làm việc trong Workspace', colorClass: 'u413-c2', icon: <User /> },
                { value: 'ADMIN', label: 'ADMIN (Quản trị viên)', desc: 'Toàn quyền quản trị hệ thống', colorClass: 'u413-c3', icon: <Shield /> },
              ]}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vai trò trong nhóm *</label>
            <LucianDropdown
              value={teamRole}
              onChange={(val) => setTeamRole(val)}
              fullWidth
              showDot
              ariaLabel="Chọn vai trò trong nhóm"
              options={[
                { value: 'MEMBER', label: 'Member (Thành viên thường)', desc: 'Nhận & làm Task', colorClass: 'u413-c0', icon: <User /> },
                { value: 'CO_LEADER', label: 'Co-Leader (Được tạo Task)', desc: 'Tạo Task & Review task mình tạo', colorClass: 'u413-c2', icon: <Award /> },
                { value: 'TEAM_LEADER', label: 'Team Leader (Được tạo Task)', desc: 'Điều phối & tạo/review Task', colorClass: 'u413-c1', icon: <Crown /> },
              ]}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản Member'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Members Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Danh Sách Thành Viên ({members.length})</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Thành viên</th>
                <th className="py-3 px-4">Email & MSSV</th>
                <th className="py-3 px-4">Quyền hệ thống</th>
                <th className="py-3 px-4">Vai trò nhóm</th>
                <th className="py-3 px-4">Quyền tạo Task</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableRowsSkeleton columns={6} rows={5} />
              ) : (
                members.map((m, idx) => {
                  const edit = roleEdits[m.id] || { role: m.role, teamRole: m.teamRole || 'MEMBER' };
                  const isSelf = currentUser?.id === m.id;
                  const isDirty = edit.role !== m.role || edit.teamRole !== (m.teamRole || 'MEMBER');

                  return (
                    <tr
                      key={m.id}
                      style={{ '--d': `${idx * 0.05}s` }}
                      className="u439-enter hover:bg-slate-50/70"
                    >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.username}`}
                          alt={m.fullName}
                          className="w-9 h-9 rounded-full bg-slate-100 object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800">
                            {m.fullName} {isSelf && <span className="text-[10px] text-indigo-600">(Bạn)</span>}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">@{m.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-700">{m.email}</p>
                      <p className="text-[11px] font-mono text-slate-400">{m.studentCode}</p>
                    </td>
                    <td className="py-3 px-4">
                      <LucianDropdown
                        value={edit.role}
                        disabled={isSelf}
                        compact
                        showDot
                        ariaLabel="Đổi quyền hệ thống"
                        onChange={(val) =>
                          setRoleEdits({ ...roleEdits, [m.id]: { ...edit, role: val } })
                        }
                        options={[
                          { value: 'ADMIN', label: 'ADMIN', desc: 'Quản trị toàn hệ thống', colorClass: 'u413-c3', icon: <Shield /> },
                          { value: 'MEMBER', label: 'MEMBER', desc: 'Thành viên dự án', colorClass: 'u413-c2', icon: <User /> },
                        ]}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <LucianDropdown
                        value={edit.teamRole}
                        compact
                        showDot
                        ariaLabel="Đổi vai trò nhóm"
                        onChange={(val) =>
                          setRoleEdits({ ...roleEdits, [m.id]: { ...edit, teamRole: val } })
                        }
                        options={[
                          { value: 'TEAM_LEADER', label: TEAM_ROLE_LABELS.TEAM_LEADER, desc: 'Tạo & review Task', colorClass: 'u413-c1', icon: <Crown /> },
                          { value: 'CO_LEADER', label: TEAM_ROLE_LABELS.CO_LEADER, desc: 'Tạo & review Task', colorClass: 'u413-c2', icon: <Award /> },
                          { value: 'MEMBER', label: TEAM_ROLE_LABELS.MEMBER, desc: 'Thành viên thường', colorClass: 'u413-c0', icon: <User /> },
                        ]}
                      />
                    </td>
                    <td className="py-3 px-4">
                      {m.canCreateTask ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          Được tạo Task & Review
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium text-[10px]">
                          Chỉ nhận & làm Task
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleSaveRole(m.id)}
                        disabled={!isDirty}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-30 transition"
                        title="Lưu thay đổi quyền"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu</span>
                      </button>
                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteMember(m)}
                          className="inline-flex items-center p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMembersPage;
