import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workspaceApi } from '../../api/workspaceApi';
import { authApi } from '../../api/authApi';
import {
  getStatusMeta,
  getTaskTypeMeta,
  getWarningInfo,
  formatDateVN,
} from '../../utils/taskHelpers';
import StatusDropdown from '../lucian/StatusDropdown';
import LucianDropdown from '../lucian/LucianDropdown';
import {
  X,
  Paperclip,
  Calendar,
  UserPlus,
  AlertTriangle,
  ExternalLink,
  Trash2,
  StickyNote,
  FileText,
  Layers,
  User,
  UserX,
} from 'lucide-react';

const TaskDetailModal = ({ task, onClose, onRefresh }) => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [busy, setBusy] = useState(false);

  const isAdminOrAssigner =
    currentUser?.role === 'ADMIN' || currentUser?.id === task?.assigner?.id;

  useEffect(() => {
    if (task && isAdminOrAssigner) {
      authApi
        .getMembers()
        .then((res) => {
          if (res?.data) setMembers(res.data);
        })
        .catch(console.error);
    }
  }, [task, isAdminOrAssigner]);

  if (!task) return null;

  const typeMeta = getTaskTypeMeta(task.taskType);
  const statusMeta = getStatusMeta(task.status);
  const warn = getWarningInfo(task);

  const handleClaim = async () => {
    setBusy(true);
    try {
      await workspaceApi.claimTask(task.id);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể nhận task');
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async (assigneeId) => {
    setBusy(true);
    try {
      await workspaceApi.assignTask(task.id, assigneeId ? Number(assigneeId) : null);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể chỉ định người làm');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setBusy(true);
    try {
      await workspaceApi.updateTaskStatus(task.id, newStatus);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xóa task ${task.taskCode} - ${task.title}?`)) return;
    setBusy(true);
    try {
      await workspaceApi.deleteTask(task.id);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa task');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/70">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono text-xs font-bold">
                {task.taskCode}
              </span>
              <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${typeMeta.color}`}>
                {typeMeta.fullLabel}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${statusMeta.badge}`}>
                {statusMeta.label}
              </span>
              {warn && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold ${warn.badgeClass}`}>
                  <AlertTriangle className="w-3 h-3" />
                  {warn.label}
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base leading-snug">{task.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                Giai đoạn (Phase)
              </span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                {task.phaseName || '-'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                Thời gian (Start Date – End Date)
              </span>
              <span className="font-mono font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {formatDateVN(task.startDate)} –{' '}
                <span className={warn ? warn.dateClass : ''}>{formatDateVN(task.endDate)}</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                Người tạo Task (Assigner)
              </span>
              <div className="flex items-center gap-2">
                <img
                  src={task.assigner?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${task.assigner?.username}`}
                  alt={task.assigner?.fullName}
                  className="w-6 h-6 rounded-full bg-slate-200 object-cover"
                />
                <span className="font-semibold text-slate-800">{task.assigner?.fullName}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                Người nhận Task (Assignee)
              </span>
              {task.assignee ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={task.assignee.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${task.assignee.username}`}
                      alt={task.assignee.fullName}
                      className="w-6 h-6 rounded-full bg-slate-200 object-cover"
                    />
                    <span className="font-semibold text-slate-800">{task.assignee.fullName}</span>
                  </div>
                  {isAdminOrAssigner && (
                    <LucianDropdown
                      value={String(task.assignee.id)}
                      disabled={busy}
                      compact
                      showDot
                      ariaLabel="Đổi người nhận Task"
                      onChange={(val) => handleAssign(val)}
                      options={[
                        { value: '', label: 'Bỏ chỉ định', desc: 'Đưa về mở để thành viên tự nhận', colorClass: 'u413-c0', icon: <UserX /> },
                        ...members.map((m) => ({
                          value: String(m.id),
                          label: m.fullName,
                          desc: m.studentCode,
                          colorClass: 'u413-c2',
                          icon: <User />,
                        })),
                      ]}
                    />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleClaim}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Nhận Task</span>
                  </button>
                  {isAdminOrAssigner && (
                    <LucianDropdown
                      value=""
                      disabled={busy}
                      compact
                      placeholder="Hoặc chỉ định..."
                      ariaLabel="Chỉ định người nhận Task"
                      onChange={(val) => val && handleAssign(val)}
                      options={members.map((m) => ({
                        value: String(m.id),
                        label: m.fullName,
                        desc: m.studentCode,
                        colorClass: 'u413-c2',
                        icon: <User />,
                      }))}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Mô tả Task</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 whitespace-pre-wrap">
              {task.description || <span className="italic text-slate-400">Chưa có mô tả chi tiết.</span>}
            </div>
          </div>

          {/* Attachment & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span>Tệp đính kèm</span>
              </h4>
              {task.attachmentUrl ? (
                <a
                  href={task.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-100 transition max-w-full"
                >
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{task.attachmentName || task.attachmentUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <p className="text-slate-400 italic">Không có tệp đính kèm.</p>
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                <span>Lưu ý</span>
              </h4>
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-slate-700 whitespace-pre-wrap">
                {task.note || <span className="italic text-slate-400">Không có lưu ý.</span>}
              </div>
            </div>
          </div>

          {/* Submission & Review */}
          {(task.workSubmissionNote || task.reviewComment) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <h4 className="font-bold text-slate-700 mb-1">Ghi chú nộp bài (Assignee)</h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  {task.workSubmissionNote || <span className="italic text-slate-400">Chưa nộp</span>}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-700 mb-1">Nhận xét Review (Assigner)</h4>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-slate-700">
                  {task.reviewComment || <span className="italic text-slate-400">Chưa có nhận xét</span>}
                </div>
              </div>
            </div>
          )}

          {/* Quick Status Switcher (Lucian #413) */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-700">Chuyển trạng thái:</span>
              <StatusDropdown
                task={task}
                currentUser={currentUser}
                disabled={busy}
                onChangeStatus={handleStatusChange}
              />
            </div>

            <div className="flex items-center gap-2">
              {isAdminOrAssigner && (
                <button
                  onClick={handleDelete}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Task</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
