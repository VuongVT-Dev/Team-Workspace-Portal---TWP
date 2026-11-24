import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workspaceApi } from '../../api/workspaceApi';
import {
  TASK_STATUSES,
  getTaskTypeMeta,
  getWarningInfo,
  canUserCreateTask,
  formatShortDateVN,
} from '../../utils/taskHelpers';
import StatusDropdown from '../lucian/StatusDropdown';
import LucianDropdown from '../lucian/LucianDropdown';
import {
  Plus,
  UserPlus,
  AlertTriangle,
  Paperclip,
  StickyNote,
  Filter,
  Lock,
  Layers,
} from 'lucide-react';
import { KanbanTaskCardSkeleton } from '../lucian/SkeletonPrimitives';

const BoardAssignTab = ({ tasks, phases = [], loading = false, onRefresh, onOpenCreateModal, onSelectTask }) => {
  const { user: currentUser } = useAuth();
  const [phaseFilter, setPhaseFilter] = useState('ALL');

  const canCreate = canUserCreateTask(currentUser);

  const filteredTasks =
    phaseFilter === 'ALL'
      ? tasks
      : tasks.filter((t) => String(t.phaseId) === String(phaseFilter));

  const handleClaim = async (e, taskId) => {
    e.stopPropagation();
    try {
      await workspaceApi.claimTask(taskId);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể nhận task');
    }
  };

  const handleMoveStatus = async (taskId, newStatus) => {
    try {
      await workspaceApi.updateTaskStatus(taskId, newStatus);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể đổi trạng thái');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Bảng Công Việc (Kanban) & Nhận Task</h3>
          <p className="text-xs text-slate-400">
            Chuẩn Flow được áp dụng: <strong className="text-slate-600">Back Log</strong> →{' '}
            <strong className="text-blue-600">Processing</strong> →{' '}
            <strong className="text-amber-600">Pending</strong> →{' '}
            <strong className="text-indigo-600">Reviewing</strong> →{' '}
            <strong className="text-emerald-600">Done</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Phase Filter (Lucian #413) */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <LucianDropdown
              value={String(phaseFilter)}
              onChange={(val) => setPhaseFilter(val)}
              hoverOpen
              showDot
              ariaLabel="Lọc theo Phase"
              options={[
                { value: 'ALL', label: 'Tất cả Phase', desc: 'Hiển thị toàn bộ giai đoạn', colorClass: 'u413-c0', icon: <Layers /> },
                ...phases.map((p) => ({
                  value: String(p.id),
                  label: `Phase ${p.displayOrder}: ${p.name}`,
                  desc: `${p.progressPercentage ?? 0}% hoàn thành`,
                  colorClass: 'u413-c1',
                  icon: <Layers />,
                })),
              ]}
            />
          </div>

          {canCreate ? (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Task Mới</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-[11px] font-medium border border-slate-200">
              <Lock className="w-3 h-3" />
              <span>Bạn không phải người có quyền tạo Task :)</span>
            </span>
          )}
        </div>
      </div>

      {/* Warning Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 px-1">
        <span className="font-semibold text-slate-600">Note:</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300 font-semibold">
          <AlertTriangle className="w-3 h-3" /> Quá hạn ở Back Log / Processing
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
          <AlertTriangle className="w-3 h-3" />Quá hạn ở Pending / Reviewing
        </span>
      </div>

      {/* 5 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
        {TASK_STATUSES.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-100/80 rounded-2xl border border-slate-200/80 flex flex-col max-h-[calc(100vh-270px)]"
            >
              {/* Column Header */}
              <div className={`px-3.5 py-2.5 rounded-t-2xl border-t-4 flex items-center justify-between ${col.colStyle}`}>
                <span className="font-bold text-xs uppercase tracking-wider">{col.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badge}`}>
                  {loading ? '…' : colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                {loading ? (
                  <KanbanTaskCardSkeleton count={2} />
                ) : colTasks.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">Trống</div>
                ) : (
                  colTasks.map((task, idx) => {
                    const typeMeta = getTaskTypeMeta(task.taskType);
                    const warn = getWarningInfo(task);

                    return (
                      <div
                        key={task.id}
                        style={{ '--d': `${idx * 0.06}s` }}
                        onClick={() => onSelectTask && onSelectTask(task)}
                        className={`u439-enter bg-white p-3.5 rounded-xl border shadow-sm hover:shadow-md transition space-y-2.5 text-xs cursor-pointer ${warn ? warn.cardRing : 'border-slate-200/90'
                          }`}
                      >
                        {/* Code + Type + Warning */}
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {task.taskCode}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${typeMeta.color}`}>
                              {typeMeta.label}
                            </span>
                          </div>
                          {warn && (
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9px] font-bold ${warn.badgeClass}`}
                              title={warn.label}
                            >
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {warn.level === 'YELLOW' ? 'Trễ (Chờ)' : 'Quá hạn'}
                            </span>
                          )}
                        </div>

                        {/* Title & Description Preview */}
                        <div>
                          <div className="font-bold text-slate-800 leading-snug line-clamp-2">
                            {task.title}
                          </div>
                          {task.description && (
                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Attachments / Notes / Assigner */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[120px]" title={`Người tạo: ${task.assigner?.fullName}`}>
                            Tạo: <strong className="text-slate-600">{task.assigner?.fullName}</strong>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {task.attachmentUrl && (
                              <span title="Có tệp đính kèm" className="text-indigo-500">
                                <Paperclip className="w-3 h-3" />
                              </span>
                            )}
                            {task.note && (
                              <span title={`Lưu ý: ${task.note}`} className="text-amber-500">
                                <StickyNote className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Assignee or Claim Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1">
                          {task.assignee ? (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <img
                                src={
                                  task.assignee.avatarUrl ||
                                  `https://api.dicebear.com/7.x/bottts/svg?seed=${task.assignee.username}`
                                }
                                alt={task.assignee.fullName}
                                className="w-5 h-5 rounded-full bg-slate-100 shrink-0 object-cover"
                              />
                              <span className="text-[11px] font-medium text-slate-700 truncate">
                                {task.assignee.fullName}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => handleClaim(e, task.id)}
                              className="w-full inline-flex items-center justify-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Nhận Task</span>
                            </button>
                          )}
                        </div>

                        {/* Dates & Status Switcher (Lucian #413) */}
                        <div className="flex items-center justify-between text-[10px] font-mono pt-1 gap-1">
                          <span className={warn ? warn.dateClass : 'text-slate-400'}>
                            {formatShortDateVN(task.startDate)} – {formatShortDateVN(task.endDate)}
                          </span>

                          <StatusDropdown
                            task={task}
                            currentUser={currentUser}
                            compact
                            onChangeStatus={(newStatus) => handleMoveStatus(task.id, newStatus)}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoardAssignTab;
