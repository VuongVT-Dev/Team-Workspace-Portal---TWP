import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workspaceApi } from '../../api/workspaceApi';
import {
  getStatusMeta,
  getTaskTypeMeta,
  getWarningInfo,
  canUserCreateTask,
  formatDateVN,
} from '../../utils/taskHelpers';
import {
  Plus,
  CheckCircle,
  Send,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  Eye,
  UserPlus,
  Paperclip,
} from 'lucide-react';
import { PhaseCardSkeleton } from '../lucian/SkeletonPrimitives';

const ProgressReviewTab = ({ phases, tasks, loading = false, onRefresh, onOpenCreatePhaseModal, onSelectTask }) => {
  const { user: currentUser } = useAuth();
  const [expandedPhases, setExpandedPhases] = useState({});
  const [submissionNotes, setSubmissionNotes] = useState({});
  const [reviewComments, setReviewComments] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const togglePhase = (phaseId) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const handleWorkSubmit = async (taskId) => {
    const note = submissionNotes[taskId];
    if (!note || !note.trim()) {
      alert('Vui lòng nhập link PR hoặc mô tả kết quả công việc');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [taskId]: true }));
    try {
      await workspaceApi.submitWork(taskId, { workSubmissionNote: note });
      onRefresh();
      alert('Đã hoàn thành & nộp bài! Task chuyển sang trạng thái PENDING chờ người tạo vào review.');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể nộp kết quả');
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const handleStartReview = async (taskId) => {
    setActionLoading((prev) => ({ ...prev, [taskId]: true }));
    try {
      await workspaceApi.startReview(taskId);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Bạn không có quyền đưa task sang Reviewing');
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const handleReview = async (taskId, decisionStatus) => {
    const comment = reviewComments[taskId];
    if (!comment || !comment.trim()) {
      alert('Vui lòng nhập nhận xét review trước khi duyệt');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [taskId]: true }));
    try {
      await workspaceApi.reviewTask(taskId, comment, decisionStatus);
      onRefresh();
      alert(
        decisionStatus === 'DONE'
          ? 'Đã duyệt DONE! Thanh tiến độ Phase đã tự động cập nhật.'
          : 'Đã gửi yêu cầu sửa lại (chuyển về Processing).'
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thực hiện review');
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const handleClaim = async (taskId) => {
    setActionLoading((prev) => ({ ...prev, [taskId]: true }));
    try {
      await workspaceApi.claimTask(taskId);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể nhận task');
    } finally {
      setActionLoading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Admin Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Tiến Độ Theo Giai Đoạn (Phase) & Quy Trình Review</h3>
          <p className="text-xs text-slate-400">
            Chuẩn Flow được áp dụng: Thành viên nộp (<strong className="text-amber-600">Pending</strong>) → Người tạo nhận review (<strong className="text-indigo-600">Reviewing</strong>) → Duyệt đạt (<strong className="text-emerald-600">Done</strong> → nhảy % Phase)
          </p>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={onOpenCreatePhaseModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thiết Lập Phase Mới (Admin)</span>
          </button>
        )}
      </div>

      {/* Phases List */}
      <div className="space-y-4">
        {loading ? (
          <PhaseCardSkeleton count={2} />
        ) : (
          phases.map((phase, idx) => {
            const isExpanded = expandedPhases[phase.id] !== false;
            const phaseTasks = tasks.filter((t) => t.phaseId === phase.id);

            return (
              <div
                key={phase.id}
                style={{ '--d': `${idx * 0.08}s` }}
                className="u439-enter bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Phase Header with Progress Bar */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {phase.displayOrder}
                        </span>
                        <h4 className="font-bold text-slate-800 text-base">{phase.name}</h4>
                        {phase.overdueTasks > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" /> {phase.overdueTasks} trễ hạn
                          </span>
                        )}
                      </div>
                      {phase.description && (
                        <p className="text-xs text-slate-500 pl-8">{phase.description}</p>
                      )}
                      <div className="text-[11px] text-slate-400 pl-8 font-mono">
                        Thời gian: {formatDateVN(phase.startDate)} – {formatDateVN(phase.endDate)}
                      </div>
                    </div>

                    {/* Progress Counter & Toggle */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-600">
                          {phase.progressPercentage}%
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium">
                          ({phase.doneTasks}/{phase.totalTasks} tasks DONE)
                        </span>
                      </div>

                      <button
                        onClick={() => togglePhase(phase.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar Visualization */}
                  <div className="mt-4 w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${phase.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Tasks Under Phase */}
                {isExpanded && (
                  <div className="p-5 space-y-4 divide-y divide-slate-100">
                    {phaseTasks.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs italic">
                        Chưa có công việc nào trong giai đoạn này.
                      </div>
                    ) : (
                      phaseTasks.map((task) => {
                        const isAssignee = currentUser?.id === task.assignee?.id;
                        const isAssigner = currentUser?.id === task.assigner?.id;
                        const canStartReview =
                          canUserCreateTask(currentUser) &&
                          (isAssigner || currentUser?.role === 'ADMIN');
                        const statusMeta = getStatusMeta(task.status);
                        const typeMeta = getTaskTypeMeta(task.taskType);
                        const warn = getWarningInfo(task);

                        return (
                          <div key={task.id} className="pt-4 first:pt-0 space-y-3">
                            {/* Task summary line */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={() => onSelectTask && onSelectTask(task)}
                                  className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition"
                                >
                                  {task.taskCode}
                                </button>
                                <h5
                                  onClick={() => onSelectTask && onSelectTask(task)}
                                  className="font-bold text-slate-800 text-sm hover:text-indigo-600 cursor-pointer transition"
                                >
                                  {task.title}
                                </h5>
                                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${typeMeta.color}`}>
                                  {typeMeta.label}
                                </span>
                                {warn && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${warn.badgeClass}`}>
                                    <AlertTriangle className="w-3 h-3" />
                                    {warn.label} (Hạn: {formatDateVN(task.endDate)})
                                  </span>
                                )}
                                {task.attachmentUrl && (
                                  <a
                                    href={task.attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:underline font-semibold"
                                  >
                                    <Paperclip className="w-3 h-3" /> Tệp đính kèm
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs flex-wrap">
                                <span className="text-slate-500">
                                  Tạo bởi: <strong className="text-slate-700">{task.assigner?.fullName}</strong>
                                </span>
                                {task.assignee ? (
                                  <span className="text-slate-500">
                                    Người nhận: <strong className="text-slate-700">{task.assignee.fullName}</strong>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleClaim(task.id)}
                                    disabled={actionLoading[task.id]}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold transition"
                                  >
                                    <UserPlus className="w-3 h-3" />
                                    <span>Nhận Task</span>
                                  </button>
                                )}
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${statusMeta.badge}`}>
                                  {statusMeta.label}
                                </span>
                              </div>
                            </div>

                            {/* Submission & Review Dual Box */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              {/* Box 1: Người nhận task (Assignee) nộp bài -> PENDING */}
                              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                                <div className="flex items-center justify-between font-semibold text-slate-700">
                                  <span>1. Nộp kết quả hoàn thành (Assignee → Pending)</span>
                                  {task.workSubmissionNote && (
                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> Đã nộp
                                    </span>
                                  )}
                                </div>

                                {task.workSubmissionNote ? (
                                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 text-xs">
                                    {task.workSubmissionNote}
                                  </div>
                                ) : (
                                  <div className="text-slate-400 italic text-[11px]">Chưa có ghi chú nộp bài.</div>
                                )}

                                {isAssignee && task.status !== 'DONE' && (
                                  <div className="space-y-2 pt-1">
                                    <textarea
                                      rows={2}
                                      value={submissionNotes[task.id] || ''}
                                      onChange={(e) =>
                                        setSubmissionNotes({ ...submissionNotes, [task.id]: e.target.value })
                                      }
                                      placeholder="Dán link PR GitHub, link tài liệu hoặc mô tả kết quả đã hoàn thành..."
                                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <button
                                      onClick={() => handleWorkSubmit(task.id)}
                                      disabled={actionLoading[task.id]}
                                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                      <span>Hoàn Thành & Chuyển Sang PENDING</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Box 2: Người tạo Task (Assigner) nhận Pending -> Reviewing -> Done */}
                              <div
                                className={`p-3.5 rounded-xl border space-y-2 ${isAssigner
                                    ? 'bg-indigo-50/50 border-indigo-200/80'
                                    : 'bg-slate-50 border-slate-200/80'
                                  }`}
                              >
                                <div className="flex items-center justify-between font-semibold text-slate-700">
                                  <span className="flex items-center gap-1.5">
                                    {!isAssigner && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                                    <span>2. Đánh giá & Duyệt ({task.assigner?.fullName})</span>
                                  </span>
                                  {task.reviewedAt && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {new Date(task.reviewedAt).toLocaleDateString('vi-VN')}
                                    </span>
                                  )}
                                </div>

                                {task.reviewComment ? (
                                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 text-xs">
                                    {task.reviewComment}
                                  </div>
                                ) : (
                                  <div className="text-slate-400 italic text-[11px]">Chưa có nhận xét review.</div>
                                )}

                                {/* Step 2a: Move PENDING -> REVIEWING */}
                                {task.status === 'PENDING' && canStartReview && (
                                  <button
                                    onClick={() => handleStartReview(task.id)}
                                    disabled={actionLoading[task.id]}
                                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Bắt Đầu Review (Chuyển sang REVIEWING)</span>
                                  </button>
                                )}

                                {/* Step 2b: Strict Assigner Review Form */}
                                {isAssigner ? (
                                  <div className="space-y-2 pt-1">
                                    <textarea
                                      rows={2}
                                      value={reviewComments[task.id] || ''}
                                      onChange={(e) =>
                                        setReviewComments({ ...reviewComments, [task.id]: e.target.value })
                                      }
                                      placeholder="Nhập nhận xét review (chất lượng code/tài liệu, góp ý chỉnh sửa)..."
                                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        onClick={() => handleReview(task.id, 'DONE')}
                                        disabled={actionLoading[task.id]}
                                        className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Duyệt DONE</span>
                                      </button>
                                      <button
                                        onClick={() => handleReview(task.id, 'PROCESSING')}
                                        disabled={actionLoading[task.id]}
                                        className="py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1"
                                      >
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>Yêu cầu sửa lại</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-500 italic bg-white/60 p-2 rounded border border-slate-200">
                                    Chế độ chỉ đọc. Chỉ người tạo task ({task.assigner?.fullName}) mới có quyền chuyển Reviewing/Done và duyệt bài.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProgressReviewTab;
