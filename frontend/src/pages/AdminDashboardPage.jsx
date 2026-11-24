import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import {
  getStatusMeta,
  getTaskTypeMeta,
  getWarningInfo,
  formatDateVN,
  TEAM_ROLE_LABELS,
} from '../utils/taskHelpers';
import CreateTaskModal from '../components/workspace/CreateTaskModal';
import CreatePhaseModal from '../components/workspace/CreatePhaseModal';
import TaskDetailModal from '../components/workspace/TaskDetailModal';
import {
  SkeletonBone,
  SkeletonCrossfade,
  TableRowsSkeleton,
} from '../components/lucian/SkeletonPrimitives';
import LucianDropdown from '../components/lucian/LucianDropdown';
import {
  RefreshCw,
  Plus,
  UserPlus,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Eye,
  Filter,
  Inbox,
  Zap,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    const start = Date.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minDelay = reducedMotion ? 0 : 380;

    try {
      const res = await adminApi.getDashboard();
      const elapsed = Date.now() - start;
      if (elapsed < minDelay) {
        await new Promise((r) => setTimeout(r, minDelay - elapsed));
      }
      if (res?.data) {
        setDashboard(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const phases = dashboard?.phases || [];
  const memberWorkloads = dashboard?.memberWorkloads || [];
  const warningTasks = dashboard?.warningTasks || [];
  const recentTasks = dashboard?.recentTasks || [];

  const filteredRecentTasks =
    statusFilter === 'ALL'
      ? recentTasks
      : recentTasks.filter((t) => t.status === statusFilter);

  const kpiSkeleton = (
    <div className="space-y-3 py-0.5">
      <div className="flex items-center justify-between">
        <SkeletonBone className="w-24 h-3.5" />
        <SkeletonBone className="w-8 h-8 rounded-lg" />
      </div>
      <div className="flex items-baseline gap-2">
        <SkeletonBone className="w-16 h-8" />
        <SkeletonBone className="w-20 h-3" />
      </div>
      <SkeletonBone className="w-full h-2 rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            Admin Control Center
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Admin Dashboard — Team Workspace Portal TWP
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tổng quan tiến độ Phase, hiệu suất thành viên và cảnh báo công việc trễ hạn
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Task</span>
          </button>
          <button
            onClick={() => setIsPhaseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tạo Phase</span>
          </button>
          <button
            onClick={() => navigate('/admin/members')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tạo Member</span>
          </button>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards with Lucian #439 Crossfade Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <SkeletonCrossfade loading={loading} delay="0s" skeleton={kpiSkeleton}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Tiến độ tổng thể</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {dashboard?.overallProgressPercentage ?? 0}%
              </span>
              <span className="text-xs font-medium text-emerald-600">
                ({dashboard?.doneTasks ?? 0}/{dashboard?.totalTasks ?? 0} DONE)
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${dashboard?.overallProgressPercentage ?? 0}%` }}
              />
            </div>
          </SkeletonCrossfade>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <SkeletonCrossfade loading={loading} delay=".08s" skeleton={kpiSkeleton}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Chờ & Đang Review</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600">
                {dashboard?.pendingReviewTasks ?? 0}
              </span>
              <span className="text-xs text-slate-400">tasks Pending/Reviewing</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Processing: <strong>{dashboard?.processingTasks ?? 0}</strong> · Back Log:{' '}
              <strong>{dashboard?.backlogTasks ?? 0}</strong>
            </p>
          </SkeletonCrossfade>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm">
          <SkeletonCrossfade loading={loading} delay=".16s" skeleton={kpiSkeleton}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-600">Cảnh báo trễ hạn</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-black text-rose-600">
                {(dashboard?.overdueRedTasks ?? 0) + (dashboard?.overdueYellowTasks ?? 0)}
              </span>
              <div className="text-[11px] space-x-1.5">
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                  Đỏ: {dashboard?.overdueRedTasks ?? 0}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                  Vàng: {dashboard?.overdueYellowTasks ?? 0}
                </span>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Đỏ: Backlog/Processing · Vàng: Pending/Reviewing
            </p>
          </SkeletonCrossfade>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <SkeletonCrossfade loading={loading} delay=".22s" skeleton={kpiSkeleton}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Nhân sự & Giai đoạn</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {dashboard?.totalMembers ?? 0}
              </span>
              <span className="text-xs text-slate-500">thành viên</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Đang vận hành <strong>{dashboard?.totalPhases ?? 0}</strong> giai đoạn (Phases)
            </p>
          </SkeletonCrossfade>
        </div>
      </div>

      {/* Phase Progress + Overdue Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Tiến Độ Theo Giai Đoạn (Phase)</span>
            </h3>
            <button
              onClick={() => navigate('/workspace')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Xem Workspace →
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="ux p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5"
                  aria-hidden="true"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <SkeletonBone className="w-5 h-5 rounded shrink-0" />
                        <SkeletonBone className="w-3/4 h-3.5" />
                      </div>
                      <SkeletonBone className="w-32 h-2.5" />
                    </div>
                    <div className="space-y-1 shrink-0">
                      <SkeletonBone className="w-10 h-5 ml-auto" />
                      <SkeletonBone className="w-16 h-2.5" />
                    </div>
                  </div>
                  <SkeletonBone className="w-full h-2 rounded-full" />
                </div>
              ))
            ) : (
              phases.map((phase, idx) => (
                <div
                  key={phase.id}
                  style={{ '--d': `${idx * 0.08}s` }}
                  className="u439-enter p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {phase.displayOrder}
                        </span>
                        <span className="font-bold text-xs text-slate-800">{phase.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        {formatDateVN(phase.startDate)} – {formatDateVN(phase.endDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-indigo-600">{phase.progressPercentage}%</span>
                      <span className="block text-[10px] text-slate-500">
                        {phase.doneTasks}/{phase.totalTasks} DONE
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${phase.progressPercentage}%` }}
                    />
                  </div>

                  {phase.overdueTasks > 0 && (
                    <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{phase.overdueTasks} task đang vượt End Date chưa Done</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Warning Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Task Chậm Tiến Độ (Warning)</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              {loading ? '...' : `${warningTasks.length} cảnh báo`}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="ux p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                  aria-hidden="true"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <SkeletonBone className="w-14 h-4 rounded" />
                      <SkeletonBone className="w-20 h-4 rounded" />
                      <SkeletonBone className="w-16 h-4 rounded" />
                    </div>
                    <SkeletonBone className="w-20 h-3.5" />
                  </div>
                  <SkeletonBone className="w-5/6 h-3.5" />
                  <div className="flex items-center justify-between">
                    <SkeletonBone className="w-32 h-3" />
                    <SkeletonBone className="w-14 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : warningTasks.length === 0 ? (
            <div className="py-12 text-center text-emerald-600 text-xs font-medium bg-emerald-50/50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              Tuyệt vời! Không có task nào bị trễ hạn.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {warningTasks.map((task, idx) => {
                const warn = getWarningInfo(task);
                const statusMeta = getStatusMeta(task.status);
                return (
                  <div
                    key={task.id}
                    style={{ '--d': `${idx * 0.08}s` }}
                    onClick={() => setSelectedTask(task)}
                    className={`u439-enter p-3 rounded-xl border cursor-pointer hover:shadow-md transition ${
                      warn?.level === 'YELLOW'
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-rose-50/60 border-rose-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-indigo-700">
                            {task.taskCode}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${warn?.badgeClass}`}>
                            {warn?.label}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusMeta.badge}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">
                          {task.title}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-700 shrink-0">
                        Hạn: {formatDateVN(task.endDate)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                      <span>Người nhận: <strong>{task.assignee?.fullName || 'Chưa nhận'}</strong></span>
                      <span className="text-indigo-600 font-semibold inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Chi tiết
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Member Workload Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Thống Kê Khối Lượng Công Việc Theo Thành Viên</h3>
            <p className="text-xs text-slate-400">Giúp Admin cân đối công việc và theo dõi hiệu suất từng người</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Thành viên</th>
                <th className="py-3 px-3">Vai trò</th>
                <th className="py-3 px-3 text-center">Tổng nhận</th>
                <th className="py-3 px-3 text-center">Back Log</th>
                <th className="py-3 px-3 text-center">Processing</th>
                <th className="py-3 px-3 text-center">Pending</th>
                <th className="py-3 px-3 text-center">Reviewing</th>
                <th className="py-3 px-3 text-center">Done</th>
                <th className="py-3 px-3 text-center">Trễ hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableRowsSkeleton columns={9} rows={5} />
              ) : (
                memberWorkloads.map((row, idx) => (
                  <tr
                    key={row.user.id}
                    style={{ '--d': `${idx * 0.05}s` }}
                    className="u439-enter hover:bg-slate-50/70"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={row.user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.user.username}`}
                          alt={row.user.fullName}
                          className="w-8 h-8 rounded-full bg-slate-100 object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{row.user.fullName}</p>
                          <p className="text-[10px] font-mono text-slate-400">{row.user.studentCode} · @{row.user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        row.user.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800'
                          : row.user.teamRole === 'TEAM_LEADER'
                          ? 'bg-indigo-100 text-indigo-800'
                          : row.user.teamRole === 'CO_LEADER'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {row.user.role === 'ADMIN' ? 'ADMIN' : TEAM_ROLE_LABELS[row.user.teamRole] || 'Member'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{row.totalAssigned}</td>
                    <td className="py-3 px-3 text-center text-slate-500">{row.backlogCount}</td>
                    <td className="py-3 px-3 text-center text-blue-600 font-semibold">{row.processingCount}</td>
                    <td className="py-3 px-3 text-center text-amber-600 font-semibold">{row.pendingCount}</td>
                    <td className="py-3 px-3 text-center text-indigo-600 font-semibold">{row.reviewingCount}</td>
                    <td className="py-3 px-3 text-center text-emerald-600 font-bold">{row.doneCount}</td>
                    <td className="py-3 px-3 text-center">
                      {row.overdueCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
                          {row.overdueCount}
                        </span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Tasks Quick Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-slate-800 text-sm">Danh Sách Công Việc Toàn Hệ Thống</h3>
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <LucianDropdown
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              hoverOpen
              showDot
              ariaLabel="Lọc theo trạng thái Task"
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái', desc: 'Hiển thị toàn bộ công việc', colorClass: 'u413-c0', icon: <Filter /> },
                { value: 'BACKLOG', label: 'Back Log', desc: 'Chờ nhận hoặc bắt đầu', colorClass: 'u413-c0', icon: <Inbox /> },
                { value: 'PROCESSING', label: 'Processing', desc: 'Đang thực hiện', colorClass: 'u413-c2', icon: <Zap /> },
                { value: 'PENDING', label: 'Pending', desc: 'Hoàn thành, chờ review', colorClass: 'u413-c3', icon: <Clock /> },
                { value: 'REVIEWING', label: 'Reviewing', desc: 'Đang kiểm tra đánh giá', colorClass: 'u413-c1', icon: <Eye /> },
                { value: 'DONE', label: 'Done', desc: 'Đã duyệt hoàn thành', colorClass: 'u413-c4', icon: <CheckCircle2 /> },
              ]}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">Mã Task</th>
                <th className="py-2.5 px-4">Tên Task</th>
                <th className="py-2.5 px-3">Loại</th>
                <th className="py-2.5 px-3">Người tạo</th>
                <th className="py-2.5 px-3">Người nhận</th>
                <th className="py-2.5 px-3">End Date</th>
                <th className="py-2.5 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableRowsSkeleton columns={7} rows={5} />
              ) : (
                filteredRecentTasks.map((task, idx) => {
                  const typeMeta = getTaskTypeMeta(task.taskType);
                  const statusMeta = getStatusMeta(task.status);
                  const warn = getWarningInfo(task);
                  return (
                    <tr
                      key={task.id}
                      style={{ '--d': `${idx * 0.04}s` }}
                      onClick={() => setSelectedTask(task)}
                      className="u439-enter hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{task.taskCode}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate">
                        {task.title}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${typeMeta.color}`}>
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{task.assigner?.fullName}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {task.assignee?.fullName || <span className="text-slate-400 italic">Chưa nhận</span>}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={warn ? warn.dateClass : 'text-slate-600'}>
                          {formatDateVN(task.endDate)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusMeta.badge}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreated={fetchDashboard}
        phases={phases}
      />
      <CreatePhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        onCreated={fetchDashboard}
      />
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onRefresh={() => {
          fetchDashboard();
          setSelectedTask(null);
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
